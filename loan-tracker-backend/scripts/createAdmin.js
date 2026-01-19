/**
 * Create Admin User Script
 * Usage: npm run create-admin <email> <password> <name>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    
    const adminEmail = args[0] || 'admin@example.com';
    const adminPassword = args[1] || 'Admin@123456';
    const adminName = args[2] || 'Admin User';

    console.log('\n📋 Creating admin user with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Password: ${adminPassword.replace(/./g, '*')}`);
    console.log('');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with this email');
      console.log('\n💡 If you want to reset the password, delete the user first or use a different email.');
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true, // Auto-verify admin
      isActive: true
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Password:', adminPassword);
    console.log('👑 Role:', admin.role);
    console.log('✉️  Email Verified:', admin.isEmailVerified);
    console.log('═══════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('\n💡 Validation errors:');
      Object.keys(error.errors).forEach((key) => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
    
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

createAdmin();