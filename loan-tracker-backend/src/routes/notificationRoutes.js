/**
 * Notification Routes
 * Test and trigger notification endpoints
 */

const express = require('express');
const router = express.Router();
const schedulerService = require('../services/schedulerService');
const emailService = require('../services/emailService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// ======================
// @desc    Test email service connection
// @route   GET /api/notifications/test-connection
// @access  Public
// ======================
router.get('/test-connection', asyncHandler(async (req, res) => {
  const result = await emailService.verify();
  
  if (result.success) {
    return ApiResponse.success(res, result, 'Email service is configured correctly');
  } else {
    return ApiResponse.error(res, result.message, 500);
  }
}));

// ======================
// @desc    Send test email
// @route   POST /api/notifications/test-email
// @access  Public
// ======================
router.post('/test-email', asyncHandler(async (req, res) => {
  const { to } = req.body;
  
  if (!to) {
    return ApiResponse.badRequest(res, 'Recipient email is required');
  }

  const result = await emailService.sendEmail({
    to,
    subject: 'Test Email - Loan Tracker',
    text: 'This is a test email from Loan Tracker. If you received this, email service is working correctly!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Test Email</h1>
          </div>
          <div class="content">
            <div class="success">
              <strong>Success!</strong> Email service is working correctly.
            </div>
            <p>This is a test email from your Loan Tracker application.</p>
            <p>If you received this message, your email configuration is set up properly!</p>
            <hr>
            <p style="color: #64748b; font-size: 12px;">
              This is an automated message from Loan Tracker
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (result.success) {
    return ApiResponse.success(res, result, 'Test email sent successfully');
  } else {
    return ApiResponse.error(res, result.message, 500);
  }
}));

// ======================
// @desc    Manually trigger reminder notifications
// @route   POST /api/notifications/trigger-reminders
// @access  Public
// ======================
router.post('/trigger-reminders', asyncHandler(async (req, res) => {
  const result = await schedulerService.triggerReminders();
  
  if (result.success) {
    return ApiResponse.success(res, result, 'Reminders sent successfully');
  } else {
    return ApiResponse.error(res, result.message || 'Failed to send reminders', 500);
  }
}));

// ======================
// @desc    Get scheduler status
// @route   GET /api/notifications/scheduler-status
// @access  Public
// ======================
router.get('/scheduler-status', asyncHandler(async (req, res) => {
  const status = schedulerService.getStatus();
  return ApiResponse.success(res, status, 'Scheduler status retrieved');
}));

module.exports = router;