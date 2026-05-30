// Load Environment variables from .env as early as possible
const dotenv = require('dotenv');
dotenv.config();

// ==========================================
// 1. Process Level Error Handling (Fail-Safe)
// ==========================================

// Catch synchronous exceptions that were not wrapped in a try/catch
process.on('uncaughtException', (err) => {
  console.error('\x1b[31m[CRITICAL] Uncaught Exception detected! Shutting down gracefully...\x1b[0m');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1); // Force immediate exit to let process managers (like PM2) reboot the instance
});

const app = require('./app');
const connectDB = require('./config/db');

// ==========================================
// 2. Database Connection
// ==========================================
connectDB();

// ==========================================
// 3. Port Allocation & Listener Ignition
// ==========================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n\x1b[36m==================================================\x1b[0m`);
  console.log(`\x1b[36m🚀 AIESEC AMARAVATI PORTAL RUNNING IN ${process.env.NODE_ENV.toUpperCase()} MODE\x1b[0m`);
  console.log(`\x1b[36m🔌 Listening on port: http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36m==================================================\x1b[0m\n`);
});

// ==========================================
// 4. Promise Rejection Interception
// ==========================================

// Handle unhandled async promise rejections (e.g. database query failures)
process.on('unhandledRejection', (err) => {
  console.error('\x1b[31m[CRITICAL] Unhandled Promise Rejection detected! Shutting down server...\x1b[0m');
  console.error(err.name, err.message);
  
  // Close the server and release ports gracefully before exiting
  server.close(() => {
    process.exit(1);
  });
});
