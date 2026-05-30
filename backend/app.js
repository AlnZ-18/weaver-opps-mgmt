const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { AppError, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');

const app = express();

// ==========================================
// 1. Security Middleware Configuration
// ==========================================

// Attach secure HTTP headers using Helmet
app.use(helmet());

// Configure Cross-Origin Resource Sharing (CORS)
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Rejected by security policy: Cross-Origin request not permitted.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ==========================================
// 2. Parsers & Logger Middleware Configuration
// ==========================================

// HTTP Request logging using Morgan (formatted appropriately based on node environment)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); // Production format
}

// Built-in JSON request parser with strict payload capacity limits (anti-DoS measure)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==========================================
// 3. Static Files & Local Asset Directives
// ==========================================
// Serve local files under /uploads if static file storage is ever required as a fallback
app.use('/uploads', express.static('uploads'));

// ==========================================
// 4. Core System & Routing Endpoints
// ==========================================

// Mount Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);

// Health Check Endpoint (useful for cloud orchestrators, container monitoring, or simple verification)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AIESEC Amaravati API service is running normally.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Placeholder route for index/API welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the AIESEC Amaravati Opportunity Portal REST API.',
    version: '1.0.0',
  });
});

// ==========================================
// 5. Unhandled Route & Global Error Handling
// ==========================================

// Intercept undefined paths and forward to the Error Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint route ${req.originalUrl} on this server.`, 404));
});

// Attach centralized global error handling middleware
app.use(errorHandler);

module.exports = app;
