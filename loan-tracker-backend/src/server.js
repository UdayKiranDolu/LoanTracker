/**
 * Server Entry Point
 * Initializes database connection and starts Express server
 */

const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const schedulerService = require('./services/schedulerService');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize scheduler service
    schedulerService.initialize();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Loan Tracker API Server                              ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║   Port: ${config.port.toString().padEnd(47)}║
║   URL: http://localhost:${config.port.toString().padEnd(32)}║
║                                                           ║
║   Endpoints:                                              ║
║   • Health:     GET  /health                              ║
║   • Loans:      GET  /api/loans                           ║
║   • Create:     POST /api/loans                           ║
║   • Statistics: GET  /api/loans/statistics                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      schedulerService.stop();
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();