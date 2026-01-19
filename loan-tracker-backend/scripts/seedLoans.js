require('dotenv').config();
const mongoose = require('mongoose');
const Loan = require('../src/models/Loan');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const seedLoans = async () => {
  try {
    await connectDB();
    
    // Get the first user (or admin)
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }
    
    console.log(`✅ Creating loans for user: ${user.name}`);
    
    // Sample loan data
    const sampleLoans = [
      {
        borrowerName: 'John Doe',
        borrowerEmail: 'john@example.com',
        loanAmount: 5000,
        loanGivenDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        interestAmount: 250,
        notes: 'Business loan',
        createdBy: user._id,
        isEmailVerified: true
      },
      {
        borrowerName: 'Jane Smith',
        borrowerEmail: 'jane@example.com',
        loanAmount: 3000,
        loanGivenDate: new Date('2024-01-15'),
        dueDate: new Date('2024-06-30'),
        interestAmount: 150,
        notes: 'Personal loan',
        createdBy: user._id,
        isEmailVerified: true
      },
      {
        borrowerName: 'Bob Johnson',
        borrowerEmail: 'bob@example.com',
        loanAmount: 10000,
        loanGivenDate: new Date('2023-12-01'),
        dueDate: new Date('2024-02-28'),
        interestAmount: 500,
        notes: 'Car loan',
        createdBy: user._id,
        isEmailVerified: true
      }
    ];
    
    // Create loans
    for (const loanData of sampleLoans) {
      const loan = await Loan.create(loanData);
      console.log(`✅ Created: ${loan.borrowerName} - $${loan.loanAmount}`);
    }
    
    console.log('\n✅ Seed data created successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedLoans();