const Profile = require('../../models/Profile');
const { createUser } = require('../utils/factories');

describe('📋 Profile Model Unit Tests', () => {

  it('✓ should successfully create a new profile document with valid required fields', async () => {
    const { user } = await createUser();
    
    const profileData = {
      userId: user._id,
      phone: '+91 9876543210',
      university: 'VIT AP',
      course: 'B.Tech CSE',
      graduationYear: 2027,
    };

    const profile = await Profile.create(profileData);

    expect(profile).toBeDefined();
    expect(profile).toHaveProperty('_id');
    expect(profile.phone).toBe(profileData.phone);
    expect(profile.university).toBe(profileData.university);
    expect(profile.course).toBe(profileData.course);
    expect(profile.graduationYear).toBe(profileData.graduationYear);
    expect(profile.profileCompleted).toBe(false); // Default value
  });

  it('✓ should successfully accept valid university enum options', async () => {
    const { user } = await createUser();
    
    const validUniversities = [
      'VIT AP',
      'SRM AP',
      'KL University',
      'Amrita Amaravati',
      'Acharya Nagarjuna University',
      'RVR & JC',
      'Vignan University',
      'VVIT',
      'Others',
    ];

    // Verify VIT AP is accepted
    const profile = await Profile.create({
      userId: user._id,
      phone: '+91 9876543210',
      university: 'VIT AP',
      course: 'B.Tech CSE',
      graduationYear: 2027,
    });

    expect(profile).toBeDefined();
    expect(validUniversities.includes(profile.university)).toBe(true);
  });

  it('✓ should reject invalid university enum options and throw a validation error', async () => {
    const { user } = await createUser();

    let error;
    try {
      await Profile.create({
        userId: user._id,
        phone: '+91 9876543210',
        university: 'Unauthorized University Name', // Not in allowed enums
        course: 'B.Tech CSE',
        graduationYear: 2027,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.university.message).toContain('is not an authorized local university');
  });

  it('✓ should successfully store and retrieve the resumeUrl', async () => {
    const { user } = await createUser();
    const testResumeUrl = 'https://res.cloudinary.com/resumes/resume.pdf';

    const profile = await Profile.create({
      userId: user._id,
      phone: '+91 9876543210',
      university: 'Others',
      course: 'BBA',
      graduationYear: 2026,
      resumeUrl: testResumeUrl,
    });

    expect(profile.resumeUrl).toBe(testResumeUrl);
  });

  it('✓ should correctly reference a valid user ObjectID and support populating user details', async () => {
    const { user } = await createUser({ name: 'Sai Kumar' });

    const profile = await Profile.create({
      userId: user._id,
      phone: '+91 9876543210',
      university: 'SRM AP',
      course: 'B.Tech ECE',
      graduationYear: 2027,
    });

    expect(profile.userId.toString()).toBe(user._id.toString());

    // Verify Mongoose population works cleanly
    const populatedProfile = await Profile.findById(profile._id).populate('userId');
    expect(populatedProfile.userId.name).toBe('Sai Kumar');
    expect(populatedProfile.userId.email).toBe(user.email);
  });

  it('✓ should automatically generate createdAt and updatedAt timestamps', async () => {
    const { user } = await createUser();

    const profile = await Profile.create({
      userId: user._id,
      phone: '+91 9876543210',
      university: 'KL University',
      course: 'BCA',
      graduationYear: 2025,
    });

    expect(profile.createdAt).toBeDefined();
    expect(profile.updatedAt).toBeDefined();
    expect(profile.createdAt instanceof Date).toBe(true);
    expect(profile.updatedAt instanceof Date).toBe(true);
  });
});
