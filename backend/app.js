const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { AppError, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// ==========================================
// 1. Security & CORS Middleware
// ==========================================

// Attach Helmet secure headers
app.use(helmet());

// Configure whitelisted CORS parameters
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
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
// 2. Logging & Payload Parsing Middlewares
// ==========================================

// HTTP Request logging using Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Built-in JSON request parses with payloads limited strictly to 10kb (Anti-DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==========================================
// 3. Static Files & System Routing
// ==========================================

// Mount Authentication API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Serve local static files under /uploads fallback
app.use('/uploads', express.static('uploads'));

// Service Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AIESEC Amaravati API service is running normally.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the AIESEC Amaravati Opportunity Portal REST API.',
    version: '1.0.0',
  });
});

// ==========================================
// 4. Fallback Routing & Global Error Interception
// ==========================================

// Intercept undefined paths
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint route ${req.originalUrl} on this server.`, 404));
});

// Bind centralized global error handling
app.use(errorHandler);

module.exports = app;
