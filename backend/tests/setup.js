const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Set testing environment flags
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secure_secret_key_for_jest_validation';
process.env.JWT_EXPIRE = '1h';

/**
 * Lifecycle hook: Boot isolated MongoDB Memory Server before running test suite
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Override connection URI to point to memory server
  process.env.MONGODB_URI = mongoUri;

  // Establish mongoose pool connection
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
});

/**
 * Lifecycle hook: Close database connections and tear down in-memory MongoDB servers
 */
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
