require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Loan = require('../src/models/Loan');
const connectDB = require('../src/config/db');

const checkAndCreateData = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // CHECK USERS
    // ============================================
    console.log('👥 CHECKING USERS...\n');
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('❌ No users found! Creating admin and test user...\n');
      
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@loantracker.com',
        password: 'Admin@123',
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      });
      console.log(`✅ Created Admin: ${admin.email}`);

      const user = await User.create({
        name: 'Test User',
        email: 'user@loantracker.com',
        password: 'User@123',
        role: 'user',
        isEmailVerified: true,
        isActive: true
      });
      console.log(`✅ Created User: ${user.email}`);
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) | Role: ${u.role} | ID: ${u._id}`);
      });
    }

    // ============================================
    // CHECK LOANS
    // ============================================
    console.log('\n💰 CHECKING LOANS...\n');
    const loans = await Loan.find({ isDeleted: false });
    
    if (loans.length === 0) {
      console.log('❌ No loans found! Creating sample loans...\n');
      
      // Get first user to assign loans
      const owner = await User.findOne();
      
      if (!owner) {
        console.log('❌ Cannot create loans - no users exist!');
        process.exit(1);
      }

      const sampleLoans = [
        {
          borrowerName: 'John Doe',
          borrowerEmail: 'john@example.com',
          borrowerPhone: '123-456-7890',
          loanAmount: 5000,
          loanGivenDate: new Date('2024-01-01'),
          dueDate: new Date('2024-12-31'),
          interestAmount: 250,
          increasedInterest: 0,
          notes: 'Business loan for equipment',
          status: 'active',
          isDeleted: false,
          createdBy: owner._id,
          history: [{
            changeType: 'initial',
            notes: 'Loan created',
            updatedAt: new Date()
          }]
        },
        {
          borrowerName: 'Jane Smith',
          borrowerEmail: 'jane@example.com',
          borrowerPhone: '234-567-8901',
          loanAmount: 3000,
          loanGivenDate: new Date('2024-01-15'),
          dueDate: new Date('2024-06-30'),
          interestAmount: 150,
          increasedInterest: 0,
          notes: 'Personal loan',
          status: 'active',
          isDeleted: false,
          createdBy: owner._id,
          history: [{
            changeType: 'initial',
            notes: 'Loan created',
            updatedAt: new Date()
          }]
        },
        {
          borrowerName: 'Bob Johnson',
          borrowerEmail: 'bob@example.com',
          borrowerPhone: '345-678-9012',
          loanAmount: 10000,
          loanGivenDate: new Date('2023-12-01'),
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
          interestAmount: 500,
          increasedInterest: 50,
          notes: 'Car loan - due soon!',
          status: 'dueSoon',
          isDeleted: false,
          createdBy: owner._id,
          history: [{
            changeType: 'initial',
            notes: 'Loan created',
            updatedAt: new Date()
          }]
        },
        {
          borrowerName: 'Alice Williams',
          borrowerEmail: 'alice@example.com',
          borrowerPhone: '456-789-0123',
          loanAmount: 2000,
          loanGivenDate: new Date('2023-06-01'),
          dueDate: new Date('2023-12-01'), // Already passed - overdue
          interestAmount: 100,
          increasedInterest: 0,
          notes: 'Education loan - OVERDUE',
          status: 'overdue',
          isDeleted: false,
          createdBy: owner._id,
          history: [{
            changeType: 'initial',
            notes: 'Loan created',
            updatedAt: new Date()
          }]
        },
        {
          borrowerName: 'Charlie Brown',
          borrowerEmail: 'charlie@example.com',
          borrowerPhone: '567-890-1234',
          loanAmount: 1500,
          loanGivenDate: new Date('2023-01-01'),
          dueDate: new Date('2023-06-01'),
          interestAmount: 75,
          increasedInterest: 0,
          notes: 'Medical loan - COMPLETED',
          status: 'completed',
          isDeleted: false,
          createdBy: owner._id,
          history: [{
            changeType: 'initial',
            notes: 'Loan created',
            updatedAt: new Date()
          }]
        }
      ];

      for (const loanData of sampleLoans) {
        const loan = await Loan.create(loanData);
        console.log(`✅ Created loan: ${loan.borrowerName} - $${loan.loanAmount} (${loan.status})`);
      }
    } else {
      console.log(`Found ${loans.length} loans:`);
      loans.forEach(loan => {
        console.log(`   - ${loan.borrowerName}: $${loan.loanAmount} | Status: ${loan.status} | Owner: ${loan.createdBy}`);
      });
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n═══════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════');
    
    const finalUsers = await User.find();
    const finalLoans = await Loan.find({ isDeleted: false });
    
    console.log(`👥 Total Users: ${finalUsers.length}`);
    console.log(`💰 Total Active Loans: ${finalLoans.length}`);
    
    // Stats
    const totalAmount = finalLoans.reduce((sum, l) => sum + l.loanAmount, 0);
    const totalInterest = finalLoans.reduce((sum, l) => sum + l.interestAmount + (l.increasedInterest || 0), 0);
    const activeCount = finalLoans.filter(l => l.status === 'active').length;
    const dueSoonCount = finalLoans.filter(l => l.status === 'dueSoon').length;
    const overdueCount = finalLoans.filter(l => l.status === 'overdue').length;
    
    console.log(`💵 Total Amount: $${totalAmount}`);
    console.log(`📈 Total Interest: $${totalInterest}`);
    console.log(`✅ Active: ${activeCount}`);
    console.log(`⚠️ Due Soon: ${dueSoonCount}`);
    console.log(`🔴 Overdue: ${overdueCount}`);
    
    console.log('\n📝 LOGIN CREDENTIALS:');
    console.log('   Admin: admin@loantracker.com / Admin@123');
    console.log('   User:  user@loantracker.com / User@123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAndCreateData();