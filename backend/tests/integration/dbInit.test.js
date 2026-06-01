const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const connectDB = require('../../config/db');

describe('🗄️ Database Initialization & System Config Tests', () => {
  let originalExit;
  let originalConsoleLog;
  let originalConsoleError;
  let originalMongoUri;

  beforeAll(() => {
    originalExit = process.exit;
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalMongoUri = process.env.MONGODB_URI;
  });

  afterAll(async () => {
    process.exit = originalExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.env.MONGODB_URI = originalMongoUri;

    // Ensure we leave the database in a connected state for downstream tests
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(originalMongoUri);
    }
  });

  beforeEach(() => {
    process.exit = jest.fn();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  // ==========================================
  // 1. ENVIRONMENT VARIABLES LOADED
  // ==========================================
  it('✓ should verify that core test environment variables are loaded', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(10);
  });

  // ==========================================
  // 2. DATABASE CONNECTS
  // ==========================================
  it('✓ should successfully establish a connection to MongoDB', async () => {
    // Ensure we start disconnected for this specific test
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    process.env.MONGODB_URI = originalMongoUri; // Point to mock memory server
    await connectDB();

    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[Database] Connected successfully'));
    expect(process.exit).not.toHaveBeenCalled();
  });

  // ==========================================
  // 3. DATABASE DISCONNECTS
  // ==========================================
  it('✓ should successfully close the active MongoDB connection', async () => {
    // Ensure it's connected first
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(originalMongoUri);
    }

    await mongoose.disconnect();

    expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
  });

  // ==========================================
  // 4. MISSING DATABASE URL THROWS ERROR & CALLS EXIT
  // ==========================================
  it('✓ should throw an error and call process.exit when MONGODB_URI is invalid or missing', async () => {
    // Ensure we start disconnected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Set to empty string/undefined to trigger connection failure
    process.env.MONGODB_URI = '';

    await connectDB();

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[Database] Connection Error'));
    expect(mongoose.connection.readyState).toBe(0); // Remains disconnected
  });

  // ==========================================
  // 5. SYSTEM HEALTH ENDPOINT
  // ==========================================
  it('✓ should return 200 OK and a healthy status from the health check endpoint', async () => {
    // Reconnect for the HTTP request to succeed normally if the app depends on DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(originalMongoUri);
    }

    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('API service is running normally');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body.env).toBe('test');
  });
});
