const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });

    console.log(`\x1b[32m[Database] Connected successfully to MongoDB host: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[Database] Connection Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

// Monitor runtime connection losses
mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m[Database] Warning: MongoDB connection lost. Attempting reconnection...\x1b[0m');
});

mongoose.connection.on('error', (err) => {
  console.error(`\x1b[31m[Database] Mongoose connection runtime error: ${err.message}\x1b[0m`);
});

module.exports = connectDB;
