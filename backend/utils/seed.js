const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment configurations from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    // 1. Establish database connection
    console.log('[Seeder] Connecting to MongoDB database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seeder] Database connection established.');

    // 2. Sample Admin Credentials
    const adminEmail = 'admin@aiesecamaravati.org';
    const adminPassword = 'Admin@123'; // Passwords will be automatically encrypted by pre-save schema hooks
    
    // 3. Check for existing administrators
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[Seeder] Warning: An administrator account with email "${adminEmail}" already exists.`);
      console.log('[Seeder] Seeding skipped.');
      process.exit(0);
    }

    // 4. Create new administrator user
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('\n\x1b[32m==================================================\x1b[0m');
    console.log('🎉 ADMINISTRATIVE SEED ACCOUNT CREATED SUCCESSFULLY!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Temporary Password: ${adminPassword}`);
    console.log('\x1b[33m⚠️  IMPORTANT: Please update this password immediately on first login.\x1b[0m');
    console.log('\x1b[32m==================================================\x1b[0m\n');
    
    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m[Seeder Failure] Error executing seed scripts: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

seedAdmin();
