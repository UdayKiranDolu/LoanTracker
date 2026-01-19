require('dotenv').config();
const mongoose = require('mongoose');
const Loan = require('../src/models/Loan');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const migrateLoanOwnership = async () => {
  try {
    await connectDB();
    
    // Get the admin user or first user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    
    // Find all loans without a createdBy field
    const loansWithoutOwner = await Loan.find({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    });
    
    console.log(`Found ${loansWithoutOwner.length} loans without owner`);
    
    // Update all loans to belong to admin
    for (const loan of loansWithoutOwner) {
      loan.createdBy = adminUser._id;
      await loan.save({ validateBeforeSave: false });
    }
    
    console.log(`✅ Successfully migrated ${loansWithoutOwner.length} loans to ${adminUser.name}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateLoanOwnership();