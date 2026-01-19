require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const resetAdmin = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Define new admin credentials
    const adminEmail = 'admin@test.com';
    const adminPassword = 'Admin@123';
    const adminName = 'Admin User';

    // Check if this email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      console.log(`⚠️ User with email ${adminEmail} already exists. Deleting...`);
      await User.deleteOne({ email: adminEmail });
      console.log('✅ Deleted existing user\n');
    }

    // Create new admin user
    console.log('📝 Creating new admin user...');
    
    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    await admin.save();

    console.log('\n═══════════════════════════════════════');
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name:     ${adminName}`);
    console.log(`👑 Role:     admin`);
    console.log('═══════════════════════════════════════\n');

    // Also create a regular test user
    const userEmail = 'user@test.com';
    const userPassword = 'User@123';
    
    const existingTestUser = await User.findOne({ email: userEmail });
    if (existingTestUser) {
      await User.deleteOne({ email: userEmail });
    }

    const testUser = new User({
      name: 'Test User',
      email: userEmail,
      password: userPassword,
      role: 'user',
      isEmailVerified: true,
      isActive: true
    });

    await testUser.save();

    console.log('═══════════════════════════════════════');
    console.log('✅ TEST USER CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log(`📧 Email:    ${userEmail}`);
    console.log(`🔑 Password: ${userPassword}`);
    console.log(`👤 Name:     Test User`);
    console.log(`👑 Role:     user`);
    console.log('═══════════════════════════════════════\n');

    // Verify passwords work by testing
    console.log('🧪 Testing login credentials...\n');
    
    const adminTest = await User.findOne({ email: adminEmail }).select('+password');
    const adminPasswordValid = await adminTest.comparePassword(adminPassword);
    console.log(`Admin login test: ${adminPasswordValid ? '✅ PASS' : '❌ FAIL'}`);

    const userTest = await User.findOne({ email: userEmail }).select('+password');
    const userPasswordValid = await userTest.comparePassword(userPassword);
    console.log(`User login test: ${userPasswordValid ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n📝 USE THESE CREDENTIALS TO LOGIN:');
    console.log('═══════════════════════════════════════');
    console.log('ADMIN:');
    console.log('   Email:    admin@test.com');
    console.log('   Password: Admin@123');
    console.log('');
    console.log('USER:');
    console.log('   Email:    user@test.com');
    console.log('   Password: User@123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAdmin();