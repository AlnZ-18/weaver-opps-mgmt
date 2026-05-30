// Load Environment variables as early as possible
const dotenv = require('dotenv');
dotenv.config();

// ==========================================
// 1. Process Level Fail-Safe Handlers
// ==========================================

process.on('uncaughtException', (err) => {
  console.error('\x1b[31m[CRITICAL] Uncaught Exception detected! Shutting down gracefully...\x1b[0m');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

const app = require('./app');
const connectDB = require('./config/db');

// ==========================================
// 2. Database connection ignition
// ==========================================
connectDB();

// ==========================================
// 3. Listening PORT Initialization
// ==========================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n\x1b[36m==================================================\x1b[0m`);
  console.log(`\x1b[36m🚀 AIESEC AMARAVATI PORTAL RUNNING IN ${process.env.NODE_ENV.toUpperCase()} MODE\x1b[0m`);
  console.log(`\x1b[36m🔌 Listening on port: http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36m==================================================\x1b[0m\n`);
});

// ==========================================
// 4. Promise Rejection Interceptions
// ==========================================

process.on('unhandledRejection', (err) => {
  console.error('\x1b[31m[CRITICAL] Unhandled Promise Rejection detected! Shutting down server...\x1b[0m');
  console.error(err.name, err.message);
  
  server.close(() => {
    process.exit(1);
  });
});
