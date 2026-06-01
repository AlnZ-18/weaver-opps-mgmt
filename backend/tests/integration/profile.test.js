const request = require('supertest');
const app = require('../../app');
const Profile = require('../../models/Profile');
const { createUser, createProfile } = require('../utils/factories');

describe('📋 Profile API Integration Tests', () => {

  // ==========================================
  // 1. CREATE PROFILE ENDPOINT TESTS
  // ==========================================
  describe('POST /api/profile/create', () => {
    it('✓ should allow an authenticated user to successfully create a profile', async () => {
      const { user, token } = await createUser();

      const profilePayload = {
        phone: '+91 9876543210',
        university: 'VIT AP',
        course: 'B.Tech CSE',
        graduationYear: 2027,
        linkedin: 'https://linkedin.com/in/testuser',
        skills: ['MERN', 'Jest', 'Supertest'],
      };

      const res = await request(app)
        .post('/api/profile/create')
        .set('Authorization', `Bearer ${token}`)
        .send(profilePayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('successfully');
      expect(res.body.profile).toBeDefined();
      expect(res.body.profile.phone).toBe(profilePayload.phone);
      expect(res.body.profile.university).toBe(profilePayload.university);
      expect(res.body.profile.course).toBe(profilePayload.course);
      expect(res.body.profile.graduationYear).toBe(profilePayload.graduationYear);
      expect(res.body.profile.linkedin).toBe(profilePayload.linkedin);
      expect(res.body.profile.skills).toEqual(expect.arrayContaining(profilePayload.skills));
      expect(res.body.profile.userId.toString()).toBe(user._id.toString());

      // Verify DB persistence
      const dbProfile = await Profile.findOne({ userId: user._id });
      expect(dbProfile).toBeDefined();
      expect(dbProfile.phone).toBe(profilePayload.phone);
    });

    it('✓ should prevent a duplicate profile if the user already has one', async () => {
      const { user, token } = await createUser();
      
      // Pre-create a profile using the factory
      await createProfile(user._id);

      const duplicatePayload = {
        phone: '+91 9111111111',
        university: 'SRM AP',
        course: 'BBA',
        graduationYear: 2026,
      };

      const res = await request(app)
        .post('/api/profile/create')
        .set('Authorization', `Bearer ${token}`)
        .send(duplicatePayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Profile already exists');
    });

    it('✓ should reject profile creation if required fields are missing', async () => {
      const { token } = await createUser();

      // Missing phone and university
      const partialPayload = {
        course: 'B.Tech CSE',
        graduationYear: 2027,
      };

      const res = await request(app)
        .post('/api/profile/create')
        .set('Authorization', `Bearer ${token}`)
        .send(partialPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required profile fields');
    });

    it('✓ should reject profile creation if the university option is invalid', async () => {
      const { token } = await createUser();

      const invalidPayload = {
        phone: '+91 9876543210',
        university: 'Oxford University', // Invalid - not in the Amaravati regional enum
        course: 'B.Tech CSE',
        graduationYear: 2027,
      };

      const res = await request(app)
        .post('/api/profile/create')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      // Mongoose ValidationError from enum field
      expect(res.body.message).toContain('is not an authorized local university');
    });
  });

  // ==========================================
  // 2. GET PROFILE ENDPOINT TESTS
  // ==========================================
  describe('GET /api/profile/me', () => {
    it('✓ should successfully fetch the authenticated user\'s own profile', async () => {
      const { user, token } = await createUser();
      const mockProfile = await createProfile(user._id, {
        phone: '+91 9998887776',
        university: 'KL University',
      });

      const res = await request(app)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile).toBeDefined();
      expect(res.body.profile._id.toString()).toBe(mockProfile._id.toString());
      expect(res.body.profile.phone).toBe(mockProfile.phone);
      expect(res.body.profile.university).toBe(mockProfile.university);

      // Verify populating user details
      expect(res.body.profile.userId).toBeDefined();
      expect(res.body.profile.userId.name).toBe(user.name);
      expect(res.body.profile.userId.email).toBe(user.email);
    });

    it('✓ should return 404 when fetching a profile that does not exist', async () => {
      const { token } = await createUser();

      const res = await request(app)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No profile found');
    });
  });

  // ==========================================
  // 3. UPDATE PROFILE ENDPOINT TESTS
  // ==========================================
  describe('PUT /api/profile/update', () => {
    it('✓ should successfully update fields in the user\'s profile', async () => {
      const { user, token } = await createUser();
      await createProfile(user._id, {
        phone: '+91 8888888888',
        university: 'VVIT',
        course: 'B.Tech IT',
        graduationYear: 2025,
      });

      const updatePayload = {
        phone: '+91 7777777777',
        university: 'SRM AP',
        course: 'B.Tech ECE',
        graduationYear: 2026,
        skills: ['React', 'NodeJS'],
      };

      const res = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('updated successfully');
      expect(res.body.profile.phone).toBe(updatePayload.phone);
      expect(res.body.profile.university).toBe(updatePayload.university);
      expect(res.body.profile.course).toBe(updatePayload.course);
      expect(res.body.profile.graduationYear).toBe(updatePayload.graduationYear);
      expect(res.body.profile.skills).toEqual(expect.arrayContaining(updatePayload.skills));

      // Verify persistence in DB
      const updatedProfile = await Profile.findOne({ userId: user._id });
      expect(updatedProfile.phone).toBe(updatePayload.phone);
      expect(updatedProfile.university).toBe(updatePayload.university);
    });

    it('✓ should reject update if an invalid university is specified', async () => {
      const { user, token } = await createUser();
      await createProfile(user._id);

      const updatePayload = {
        university: 'Harvard University', // Invalid enum value
      };

      const res = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('is not an authorized local university');
    });

    it('✓ should return 404 when trying to update a profile that does not exist', async () => {
      const { token } = await createUser();

      const res = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '+91 9999999999' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Profile not found');
    });
  });

  // ==========================================
  // 4. UNAUTHORIZED ACCESS BLOCKED TESTS
  // ==========================================
  describe('🔒 Unauthorized Access Protection', () => {
    it('✓ should block profile creation if token is missing', async () => {
      const res = await request(app)
        .post('/api/profile/create')
        .send({
          phone: '+91 9876543210',
          university: 'VIT AP',
          course: 'B.Tech CSE',
          graduationYear: 2027,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide a valid Bearer authentication token');
    });

    it('✓ should block profile fetching if token is missing', async () => {
      const res = await request(app)
        .get('/api/profile/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide a valid Bearer authentication token');
    });

    it('✓ should block profile update if token is missing', async () => {
      const res = await request(app)
        .put('/api/profile/update')
        .send({ phone: '+91 9876543210' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide a valid Bearer authentication token');
    });

    it('✓ should block access if JWT signature is malformed', async () => {
      const res = await request(app)
        .get('/api/profile/me')
        .set('Authorization', 'Bearer malformed_jwt_token_example');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired token signature');
    });
  });
});
