/**
 * Scheduler Service
 * Handles scheduled tasks using node-cron
 */

const cron = require('node-cron');
const Loan = require('../models/Loan');
const emailService = require('./emailService');
const config = require('../config/env');
const { getDaysRemaining, getEffectiveDueDate } = require('../utils/statusCalculator');

class SchedulerService {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Initialize all scheduled jobs
   */
  initialize() {
    if (this.isRunning) {
      console.warn('⚠️ Scheduler already running');
      return;
    }

    // Initialize email service
    emailService.initialize();

    // Schedule daily reminder job
    this.scheduleDailyReminders();

    this.isRunning = true;
    console.log('✅ Scheduler service initialized');
  }

  /**
   * Schedule daily loan reminders
   * Runs at configured time (default: 9 AM daily)
   */
  scheduleDailyReminders() {
    const cronExpression = config.notifications.cron;

    const job = cron.schedule(cronExpression, async () => {
      console.log('🔄 Running daily loan reminder job...');
      await this.processReminders();
    });

    this.jobs.push(job);
    console.log(`📅 Daily reminders scheduled: ${cronExpression}`);
  }

  /**
   * Process loan reminders
   * Sends emails for due soon and overdue loans
   */
  async processReminders() {
    try {
      const dueSoonDays = config.notifications.daysBeforeDue;

      // Get due soon loans
      const dueSoonLoans = await Loan.findDueSoon(dueSoonDays);
      console.log(`📋 Found ${dueSoonLoans.length} loans due soon`);

      // Get overdue loans
      const overdueLoans = await Loan.findOverdue();
      console.log(`📋 Found ${overdueLoans.length} overdue loans`);

      // Send due soon reminders
      for (const loan of dueSoonLoans) {
        const daysRemaining = getDaysRemaining(getEffectiveDueDate(loan));
        await emailService.sendDueReminder(loan, daysRemaining);
      }

      // Send overdue notifications
      for (const loan of overdueLoans) {
        const daysOverdue = Math.abs(getDaysRemaining(getEffectiveDueDate(loan)));
        await emailService.sendOverdueNotification(loan, daysOverdue);
      }

      console.log('✅ Daily reminder job completed');

      return {
        success: true,
        dueSoonCount: dueSoonLoans.length,
        overdueCount: overdueLoans.length,
      };
    } catch (error) {
      console.error('❌ Reminder job failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manually trigger reminder processing (for testing)
   */
  async triggerReminders() {
    console.log('🔄 Manually triggering reminders...');
    return this.processReminders();
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    this.isRunning = false;
    console.log('⏹️ Scheduler service stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobCount: this.jobs.length,
      cronExpression: config.notifications.cron,
      dueSoonThreshold: config.notifications.daysBeforeDue,
    };
  }
}

// Export singleton instance
const schedulerService = new SchedulerService();
module.exports = schedulerService;