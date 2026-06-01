const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Opportunity = require('../../models/Opportunity');

/**
 * Reusable Test Factory utilities
 */

/**
 * Create a mock standard user (student) in the in-memory database
 * @param {Object} overrides - Fields to customize
 * @returns {Promise<Object>} Created user model and signed JWT token
 */
const createUser = async (overrides = {}) => {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const defaultUser = {
    name: `Test User ${uniqueId}`,
    email: `testuser-${uniqueId}@gmail.com`,
    password: 'Password123!',
    role: 'user',
  };

  const user = await User.create({ ...defaultUser, ...overrides });
  const token = user.generateJWT();

  return { user, token };
};

/**
 * Create a mock admin user in the in-memory database
 * @param {Object} overrides - Fields to customize
 * @returns {Promise<Object>} Created admin model and signed JWT token
 */
const createAdmin = async (overrides = {}) => {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const defaultAdmin = {
    name: `Test Admin ${uniqueId}`,
    email: `testadmin-${uniqueId}@gmail.com`,
    password: 'Password123!',
    role: 'admin',
  };

  const admin = await User.create({ ...defaultAdmin, ...overrides });
  const token = admin.generateJWT();

  return { admin, token };
};

/**
 * Create a mock Profile in the in-memory database
 * @param {string} userId - Target Mongoose User ObjectID
 * @param {Object} overrides - Fields to customize
 * @returns {Promise<Object>} Created profile document
 */
const createProfile = async (userId, overrides = {}) => {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const defaultProfile = {
    userId,
    phone: `+91 999${uniqueId}`.substring(0, 15),
    university: 'VIT AP',
    course: 'B.Tech Computer Science',
    graduationYear: 2027,
    linkedin: `https://www.linkedin.com/in/testuser-${uniqueId}`,
    skills: ['JavaScript', 'Testing'],
    profileCompleted: true,
  };

  return await Profile.create({ ...defaultProfile, ...overrides });
};

/**
 * Create a mock Opportunity in the in-memory database
 * @param {string} createdById - Target Admin creator User ObjectID
 * @param {Object} overrides - Fields to customize
 * @returns {Promise<Object>} Created opportunity document
 */
const createOpportunity = async (createdById, overrides = {}) => {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const defaultOpportunity = {
    title: `Software Engineer Intern ${uniqueId}`,
    programType: 'GTa',
    country: 'Germany',
    city: 'Berlin',
    description: 'A premium MERN software engineering exchange opportunity.',
    stipend: '€1,000 EUR/month',
    duration: 12,
    skillsRequired: ['JavaScript', 'React'],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
    status: 'Open',
    createdBy: createdById,
  };

  return await Opportunity.create({ ...defaultOpportunity, ...overrides });
};

module.exports = {
  createUser,
  createAdmin,
  createProfile,
  createOpportunity,
};
