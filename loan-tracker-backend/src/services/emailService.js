/**
 * Email Service
 * Handles email sending via Nodemailer
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    if (this.initialized) return;

    // Check if email credentials are configured
    if (!config.smtp.user || !config.smtp.pass) {
      console.warn('⚠️ Email service not configured - missing SMTP credentials');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    this.initialized = true;
    console.log('✅ Email service initialized');
  }

  /**
   * Verify transporter connection
   */
  async verify() {
    if (!this.transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('❌ Email verification failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   */
  async sendEmail({ to, subject, text, html }) {
    if (!this.transporter) {
      console.warn('⚠️ Email not sent - service not configured');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: config.smtp.from,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Send loan due reminder email
   * @param {Object} loan - Loan document
   * @param {number} daysRemaining - Days until due
   */
  async sendDueReminder(loan, daysRemaining) {
    const subject = `Loan Due Reminder - ${loan.borrowerName}`;

    const text = `
      Loan Due Reminder
      
      Borrower: ${loan.borrowerName}
      Due Date: ${new Date(loan.effectiveDueDate || loan.extendedDueDate || loan.dueDate).toLocaleDateString()}
      Days Remaining: ${daysRemaining}
      Loan Amount: $${loan.loanAmount.toLocaleString()}
      Interest: $${(loan.interestAmount + (loan.increasedInterest || 0)).toLocaleString()}
      
      Please take necessary action.
    `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .label { font-weight: 600; color: #64748b; }
          .value { color: #1e293b; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Loan Due Reminder</h1>
          </div>
          <div class="content">
            <div class="warning">
              <strong>⚠️ This loan is due in ${daysRemaining} day(s)!</strong>
            </div>
            
            <div class="detail-row">
              <span class="label">Borrower:</span>
              <span class="value">${loan.borrowerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Due Date:</span>
              <span class="value">${new Date(loan.effectiveDueDate || loan.extendedDueDate || loan.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Loan Amount:</span>
              <span class="value">$${loan.loanAmount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Interest:</span>
              <span class="value">$${(loan.interestAmount + (loan.increasedInterest || 0)).toLocaleString()}</span>
            </div>
            
            <p style="margin-top: 20px;">Please take necessary action to follow up on this loan.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Loan Tracker</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to admin/configured email (not borrower in this case)
    return this.sendEmail({
      to: config.smtp.user, // Send to admin
      subject,
      text,
      html,
    });
  }

  /**
   * Send overdue notification email
   * @param {Object} loan - Loan document
   * @param {number} daysOverdue - Days past due
   */
  async sendOverdueNotification(loan, daysOverdue) {
    const subject = `⚠️ OVERDUE: Loan - ${loan.borrowerName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .label { font-weight: 600; color: #64748b; }
          .value { color: #1e293b; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Loan Overdue Alert</h1>
          </div>
          <div class="content">
            <div class="alert">
              <strong>⚠️ This loan is ${daysOverdue} day(s) overdue!</strong>
            </div>
            
            <div class="detail-row">
              <span class="label">Borrower:</span>
              <span class="value">${loan.borrowerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Due Date:</span>
              <span class="value">${new Date(loan.effectiveDueDate || loan.extendedDueDate || loan.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Days Overdue:</span>
              <span class="value" style="color: #ef4444; font-weight: bold;">${daysOverdue} days</span>
            </div>
            <div class="detail-row">
              <span class="label">Loan Amount:</span>
              <span class="value">$${loan.loanAmount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Interest:</span>
              <span class="value">$${(loan.interestAmount + (loan.increasedInterest || 0)).toLocaleString()}</span>
            </div>
            
            <p style="margin-top: 20px; color: #ef4444; font-weight: bold;">
              Immediate action required!
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Loan Tracker</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: config.smtp.user,
      subject,
      text: `Loan for ${loan.borrowerName} is ${daysOverdue} days overdue!`,
      html,
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;

// Send verification email
exports.sendVerificationEmail = async (email, name, verificationUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - Loan Tracker',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; 
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for registering with Loan Tracker!</p>
            <p>Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Loan Tracker - Manage your loans efficiently</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request - Loan Tracker',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #DC2626; 
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
            <p><strong>This link will expire in 10 minutes.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>Loan Tracker - Manage your loans efficiently</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send password changed confirmation
exports.sendPasswordChangedEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Changed - Loan Tracker',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>This is a confirmation that your password has been successfully changed.</p>
            <p>If you didn't make this change, please contact support immediately.</p>
          </div>
          <div class="footer">
            <p>Loan Tracker - Manage your loans efficiently</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};