// /**
//  * Express Application Configuration
//  * Sets up middleware, routes, and error handling
//  */

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

// const config = require('./config/env');
// const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// // Import routes
// const loanRoutes = require('./routes/loanRoutes');

// // Initialize Express app
// const app = express();

// // ======================
// // Security Middleware
// // ======================
// app.use(helmet());

// // ======================
// // CORS Configuration
// // ======================
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (mobile apps, curl, etc.)
//     if (!origin) return callback(null, true);
    
//     const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());
    
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };

// app.use(cors(corsOptions));

// // ======================
// // Body Parsing
// // ======================
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // ======================
// // Request Logging
// // ======================
// if (config.isDevelopment) {
//   app.use(morgan('dev'));
// } else {
//   app.use(morgan('combined'));
// }

// // ======================
// // Health Check Route
// // ======================
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Loan Tracker API is running',
//     environment: config.nodeEnv,
//     timestamp: new Date().toISOString(),
//   });
// });

// // ======================
// // API Routes
// // ======================
// app.use('/api/loans', loanRoutes);

// // ======================
// // Root Route
// // ======================
// app.get('/', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Welcome to Loan Tracker API',
//     version: '1.0.0',
//     endpoints: {
//       health: '/health',
//       loans: '/api/loans',
//       loansDueSoon: '/api/loans/status/duesoon',
//       loansOverdue: '/api/loans/status/overdue',
//       statistics: '/api/loans/statistics',
//     },
//   });
// });

// // ======================
// // Error Handling
// // ======================
// app.use(notFoundHandler);
// app.use(errorHandler);

// module.exports = app;






/**
 * Express Application Configuration
 * Sets up middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const loanRoutes = require('./routes/loanRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express app
const app = express();

// ======================
// Security Middleware
// ======================
app.use(helmet());

// ======================
// CORS Configuration
// ======================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ======================
// Body Parsing
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// Request Logging
// ======================
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ======================
// Health Check Route
// ======================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Loan Tracker API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ======================
// API Routes
// ======================
app.use('/api/loans', loanRoutes);
app.use('/api/notifications', notificationRoutes);

// ======================
// Root Route
// ======================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Loan Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      loans: '/api/loans',
      loansDueSoon: '/api/loans/status/duesoon',
      loansOverdue: '/api/loans/status/overdue',
      statistics: '/api/loans/statistics',
      notifications: '/api/notifications',
    },
  });
});

// ======================
// Error Handling
// ======================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;