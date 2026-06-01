const request = require('supertest');
const express = require('express');
const { Writable } = require('stream');
const authRoutes = require('../../routes/authRoutes');
const profileRoutes = require('../../routes/profileRoutes');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { authenticateUser, authorizeAdmin } = require('../../middleware/authMiddleware');
const { errorHandler } = require('../../middleware/errorMiddleware');

// Mock Cloudinary for the E2E upload flow
const mockUploadStream = jest.fn((options, callback) => {
  const stream = new Writable({
    write(chunk, encoding, next) {
      next();
    },
  });
  stream.on('finish', () => {
    callback(null, {
      secure_url: 'https://res.cloudinary.com/mock-cloud/raw/upload/aiesec_resumes/e2e_resume.pdf',
    });
  });
  return stream;
});

jest.mock('../../config/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload_stream: (options, callback) => mockUploadStream(options, callback),
    },
  },
  isCloudinaryConfigured: true,
}));

// Build E2E express harness mounting real routers and error handlers
const e2eApp = express();
e2eApp.use(express.json());

// Real routes
e2eApp.use('/api/auth', authRoutes);
e2eApp.use('/api/profile', profileRoutes);

// Admin integration endpoint
e2eApp.get(
  '/api/admin/dashboard',
  authenticateUser,
  authorizeAdmin,
  (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the Admin Dashboard!' });
  }
);

// Global Error Handler
e2eApp.use(errorHandler);

describe('🏁 AIESEC Opportunity Portal: End-to-End Integration Scenarios', () => {

  beforeEach(() => {
    mockUploadStream.mockClear();
  });

  // ==========================================
  // SCENARIO 1: COMPLETE USER PROFILE CYCLE
  // ==========================================
  describe('Scenario 1: User Registration, Login, Profile Creation, Fetching, and Updating', () => {
    it('✓ should successfully complete all steps of the profile management cycle', async () => {
      const email = 'e2e-user@gmail.com';
      const password = 'Password123!';
      const name = 'E2E User';

      // 1. Register User
      const registerRes = await request(e2eApp)
        .post('/api/auth/register')
        .send({ name, email, password });

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.token).toBeDefined();

      // 2. Login User
      const loginRes = await request(e2eApp)
        .post('/api/auth/login')
        .send({ email, password });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      const token = loginRes.body.token;
      expect(token).toBeDefined();

      // 3. Create Profile
      const profilePayload = {
        phone: '+91 9000100020',
        university: 'VIT AP',
        course: 'B.Tech CSE',
        graduationYear: 2027,
        linkedin: 'https://linkedin.com/in/e2euser',
        skills: ['JavaScript', 'MERN'],
      };

      const createProfileRes = await request(e2eApp)
        .post('/api/profile/create')
        .set('Authorization', `Bearer ${token}`)
        .send(profilePayload);

      expect(createProfileRes.statusCode).toBe(201);
      expect(createProfileRes.body.success).toBe(true);
      expect(createProfileRes.body.profile.phone).toBe(profilePayload.phone);
      expect(createProfileRes.body.profile.profileCompleted).toBe(true);

      // 4. Fetch Profile
      const fetchProfileRes = await request(e2eApp)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${token}`);

      expect(fetchProfileRes.statusCode).toBe(200);
      expect(fetchProfileRes.body.success).toBe(true);
      expect(fetchProfileRes.body.profile.university).toBe(profilePayload.university);
      expect(fetchProfileRes.body.profile.userId.email).toBe(email);

      // 5. Update Profile
      const updatePayload = {
        phone: '+91 9999988888',
        skills: ['React', 'Node', 'Express', 'MongoDB'],
      };

      const updateProfileRes = await request(e2eApp)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      expect(updateProfileRes.statusCode).toBe(200);
      expect(updateProfileRes.body.success).toBe(true);
      expect(updateProfileRes.body.profile.phone).toBe(updatePayload.phone);
      expect(updateProfileRes.body.profile.skills).toEqual(expect.arrayContaining(updatePayload.skills));

      // Assert state in DB
      const finalDbProfile = await Profile.findOne({ userId: registerRes.body.user._id });
      expect(finalDbProfile.phone).toBe(updatePayload.phone);
    });
  });

  // ==========================================
  // SCENARIO 2: COMPLETE RESUME UPLOAD FLOW
  // ==========================================
  describe('Scenario 2: User Registration, Login, and Resume Upload', () => {
    it('✓ should successfully register, login, and upload a resume saving the secure URL', async () => {
      const email = 'e2e-resume@gmail.com';
      const password = 'Password123!';
      const name = 'Resume E2E User';

      // 1. Register User
      const registerRes = await request(e2eApp)
        .post('/api/auth/register')
        .send({ name, email, password });

      expect(registerRes.statusCode).toBe(201);
      const token = registerRes.body.token;

      // 2. Pre-create active profile card (Required for resume uploads)
      await request(e2eApp)
        .post('/api/profile/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          phone: '+91 8000100020',
          university: 'SRM AP',
          course: 'B.Tech IT',
          graduationYear: 2026,
        });

      // 3. Upload Resume
      const pdfBuffer = Buffer.from('%PDF-1.4 mock PDF raw payload');
      const uploadRes = await request(e2eApp)
        .post('/api/profile/upload-resume')
        .set('Authorization', `Bearer ${token}`)
        .attach('resume', pdfBuffer, 'e2e-resume.pdf');

      expect(uploadRes.statusCode).toBe(200);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.resumeUrl).toBe('https://res.cloudinary.com/mock-cloud/raw/upload/aiesec_resumes/e2e_resume.pdf');
      expect(mockUploadStream).toHaveBeenCalledTimes(1);

      // 4. Verify saved resume URL on profile fetch
      const fetchProfileRes = await request(e2eApp)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${token}`);

      expect(fetchProfileRes.statusCode).toBe(200);
      expect(fetchProfileRes.body.profile.resumeUrl).toBe('https://res.cloudinary.com/mock-cloud/raw/upload/aiesec_resumes/e2e_resume.pdf');
    });
  });

  // ==========================================
  // SCENARIO 3: COMPLETE ADMIN ROUTE SECURITY
  // ==========================================
  describe('Scenario 3: Administrative Creation, Login, and RBAC Access Check', () => {
    it('✓ should allow registered admins to successfully log in and access protected administrative endpoints', async () => {
      const email = 'e2e-admin@gmail.com';
      const password = 'Password123!';
      const name = 'E2E Administrator';

      // 1. Create Admin
      const registerRes = await request(e2eApp)
        .post('/api/auth/register')
        .send({
          name,
          email,
          password,
          role: 'admin',
        });

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body.user.role).toBe('admin');

      // 2. Login Admin
      const loginRes = await request(e2eApp)
        .post('/api/auth/login')
        .send({ email, password });

      expect(loginRes.statusCode).toBe(200);
      const token = loginRes.body.token;
      expect(token).toBeDefined();

      // 3. Access Admin Dashboard Endpoint
      const adminDashboardRes = await request(e2eApp)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(adminDashboardRes.statusCode).toBe(200);
      expect(adminDashboardRes.body.success).toBe(true);
      expect(adminDashboardRes.body.message).toContain('Admin Dashboard');
    });
  });
});
