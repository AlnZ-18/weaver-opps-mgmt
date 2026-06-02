const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log(`[Database] Connecting to MongoDB: ${mongoUri.split('@')[1] || mongoUri}...`);
    
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 4000, // Timeout after 4 seconds to prevent hanging
    });

    console.log(`\x1b[32m[Database] Connected successfully to MongoDB host: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.warn(`\x1b[33m[Database] Warning: Initial MongoDB Atlas connection failed: ${error.message}\x1b[0m`);
    
    // Graceful in-memory fallback for local development or testing environments
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log(`\x1b[36m[Database] Local Environment Fallback: Booting in-memory MongoDB Server...\x1b[0m`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        
        const conn = await mongoose.connect(memoryUri, {
          autoIndex: true,
        });
        console.log(`\x1b[32m[Database] Success: Gracefully connected to in-memory server at host: ${conn.connection.host}\x1b[0m`);
      } catch (fallbackError) {
        console.error(`\x1b[31m[Database] Critical Fallback Error: ${fallbackError.message}\x1b[0m`);
        process.exit(1);
      }
    } else {
      console.error(`\x1b[31m[Database] Critical: Mongoose connection failed in production:\x1b[0m`, error);
      process.exit(1);
    }
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

