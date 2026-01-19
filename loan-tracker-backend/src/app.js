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
// const notificationRoutes = require('./routes/notificationRoutes');

// // Initialize Express app
// const app = express();

// // ======================
// // Security Middleware
// // ======================
// app.use(helmet());

// // ======================
// // CORS Configuration
// // ======================
// const allowedOrigins = (
//   config.corsOrigin ||
//   'http://localhost:5173,https://loan-tracker.vercel.app/'
// )
//   .split(',')
//   .map((origin) => origin.trim());

// const corsOptions = {
//   origin: (origin, callback) => {
//     // Allow server-to-server, Postman, curl, etc.
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     console.error(`❌ CORS blocked request from origin: ${origin}`);
//     callback(new Error('Not allowed by CORS'));
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
// app.use('/api/notifications', notificationRoutes);

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
//       notifications: '/api/notifications',
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
const cookieParser = require('cookie-parser'); // NEW: For handling cookies
const mongoSanitize = require('express-mongo-sanitize'); // NEW: Prevent NoSQL injection

const config = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter'); // NEW: Rate limiting

// Import routes
const authRoutes = require('./routes/authRoutes'); // NEW: Authentication routes
const loanRoutes = require('./routes/loanRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express app
const app = express();

// ======================
// Security Middleware
// ======================
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // NEW: Prevent NoSQL injection attacks

// ======================
// CORS Configuration
// ======================
const allowedOrigins = (
  config.corsOrigin ||
  'http://localhost:5173,https://loan-tracker.vercel.app/'
)
  .split(',')
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, Postman, curl, etc.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`❌ CORS blocked request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Important for cookies and authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // NEW: Allow Authorization header
};

app.use(cors(corsOptions));

// ======================
// Body Parsing
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // NEW: Parse cookies for refresh tokens

// ======================
// Request Logging
// ======================
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ======================
// NEW: Rate Limiting
// Apply to all API routes
// ======================
app.use('/api', apiLimiter);

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
app.use('/api/auth', authRoutes); // NEW: Authentication routes (login, register, etc.)
app.use('/api/loans', loanRoutes); // Protected routes (requires authentication)
app.use('/api/notifications', notificationRoutes);

// ======================
// Root Route
// ======================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Loan Tracker API',
    version: '1.0.0', // NEW: Consider updating to 2.0.0 for authentication update
    endpoints: {
      // NEW: Authentication endpoints
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        me: '/api/auth/me',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password/:token',
        updatePassword: '/api/auth/update-password',
        updateProfile: '/api/auth/update-profile',
      },
      // Existing endpoints
      health: '/health',
      loans: '/api/loans',
      loansDueSoon: '/api/loans/status/duesoon',
      loansOverdue: '/api/loans/status/overdue',
      statistics: '/api/loans/statistics',
      notifications: '/api/notifications',
    },
    // NEW: Authentication info
    authentication: {
      required: true,
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
    },
  });
});

// ======================
// Error Handling
// ======================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;





















