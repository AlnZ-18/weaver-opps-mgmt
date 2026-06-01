const request = require('supertest');
const { Writable } = require('stream');
const app = require('../../app');
const Profile = require('../../models/Profile');
const { createUser, createProfile } = require('../utils/factories');

// Mock Cloudinary config/module completely to avoid external API calls
const mockUploadStream = jest.fn((options, callback) => {
  const stream = new Writable({
    write(chunk, encoding, next) {
      next();
    },
  });
  stream.on('finish', () => {
    callback(null, {
      secure_url: 'https://res.cloudinary.com/mock-cloud/raw/upload/aiesec_resumes/resume.pdf',
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

describe('📁 Resume Upload API Integration Tests', () => {
  beforeEach(() => {
    mockUploadStream.mockClear();
  });

  it('✓ should successfully upload a valid PDF and save the resume URL to the profile', async () => {
    const { user, token } = await createUser();
    // Seed profile in database first
    await createProfile(user._id, { resumeUrl: undefined });

    const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', pdfBuffer, 'resume.pdf');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('uploaded and registered successfully');
    expect(res.body.resumeUrl).toBe('https://res.cloudinary.com/mock-cloud/raw/upload/aiesec_resumes/resume.pdf');

    // Verify Cloudinary mock was triggered
    expect(mockUploadStream).toHaveBeenCalledTimes(1);

    // Verify database persistence
    const updatedProfile = await Profile.findOne({ userId: user._id });
    expect(updatedProfile.resumeUrl).toBe('https://res.cloudinary.com/mock-cloud/raw/upload/aiesec_resumes/resume.pdf');
    expect(updatedProfile.profileCompleted).toBe(true);
  });

  it('✓ should reject file uploads with JPG format', async () => {
    const { user, token } = await createUser();
    await createProfile(user._id);

    const imgBuffer = Buffer.from('fake jpg data');

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', imgBuffer, 'photo.jpg');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Only PDF documents are allowed');
    expect(mockUploadStream).not.toHaveBeenCalled();
  });

  it('✓ should reject file uploads with PNG format', async () => {
    const { user, token } = await createUser();
    await createProfile(user._id);

    const imgBuffer = Buffer.from('fake png data');

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', imgBuffer, 'avatar.png');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Only PDF documents are allowed');
    expect(mockUploadStream).not.toHaveBeenCalled();
  });

  it('✓ should reject file uploads with DOCX format', async () => {
    const { user, token } = await createUser();
    await createProfile(user._id);

    const docBuffer = Buffer.from('fake docx data');

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', docBuffer, 'document.docx');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Only PDF documents are allowed');
    expect(mockUploadStream).not.toHaveBeenCalled();
  });

  it('✓ should reject file uploads larger than 5MB', async () => {
    const { user, token } = await createUser();
    await createProfile(user._id);

    // Create a buffer larger than 5MB (e.g. 5.1 MB)
    const largeBuffer = Buffer.alloc(5.1 * 1024 * 1024);

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', largeBuffer, 'large_resume.pdf');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exceeds the maximum limit of 5MB');
    expect(mockUploadStream).not.toHaveBeenCalled();
  });

  it('✓ should reject resume uploads from unauthenticated requests', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 mock content');

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .attach('resume', pdfBuffer, 'resume.pdf');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Please provide a valid Bearer authentication token');
    expect(mockUploadStream).not.toHaveBeenCalled();
  });

  it('✓ should reject resume uploads if no file is sent in the request', async () => {
    const { token } = await createUser();

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Please select a valid PDF file to upload');
    expect(mockUploadStream).not.toHaveBeenCalled();
  });

  it('✓ should reject resume uploads if the user profile card does not exist yet', async () => {
    const { token } = await createUser(); // Profile not created

    const pdfBuffer = Buffer.from('%PDF-1.4 mock content');

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', pdfBuffer, 'resume.pdf');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Profile not found. Please create your profile card before uploading a resume');
    expect(mockUploadStream).not.toHaveBeenCalled();
  });
});
