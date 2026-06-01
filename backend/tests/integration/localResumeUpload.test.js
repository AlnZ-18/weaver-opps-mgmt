const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../app');
const Profile = require('../../models/Profile');
const { createUser, createProfile } = require('../utils/factories');

// Mock Cloudinary config/module as NOT configured to force local disk storage fallback
jest.mock('../../config/cloudinary', () => ({
  cloudinary: {},
  isCloudinaryConfigured: false,
}));

describe('📁 Local Resume Disk Storage Fallback Integration Tests', () => {
  it('✓ should successfully save resume using local disk fallback when Cloudinary is not configured', async () => {
    const { user, token } = await createUser();
    await createProfile(user._id);

    const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');

    const res = await request(app)
      .post('/api/profile/upload-resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', pdfBuffer, 'local-resume.pdf');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resumeUrl).toContain('/uploads/resume-');
    expect(res.body.resumeUrl).toContain('.pdf');

    // Clean up uploaded test file from local /uploads folder to keep environment tidy
    const filename = res.body.resumeUrl.split('/uploads/')[1];
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Verify DB update
    const dbProfile = await Profile.findOne({ userId: user._id });
    expect(dbProfile.resumeUrl).toBe(res.body.resumeUrl);
  });
});
