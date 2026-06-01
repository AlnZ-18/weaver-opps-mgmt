const request = require('supertest');
const express = require('express');
const app = require('../../app');
const { createUser, createAdmin } = require('../utils/factories');
const { authenticateUser, authorizeAdmin } = require('../../middleware/authMiddleware');

// Define a clean Express test application for RBAC integration tests
const securityApp = express();
securityApp.use(express.json());
securityApp.get(
  '/api/test-security-admin-only',
  authenticateUser,
  authorizeAdmin,
  (req, res) => {
    res.status(200).json({ success: true, message: 'Administrative access granted.' });
  }
);
// Standard error handler for test app
securityApp.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

describe('🔒 AIESEC Opportunity Portal: API Security & Robustness Tests', () => {

  // ==========================================
  // 1. PASSWORD NEVER RETURNED IN RESPONSES
  // ==========================================
  describe('Credential Leakage Protection', () => {
    it('✓ should never expose the hashed password when registering a user', async () => {
      const payload = {
        name: 'Security John',
        email: 'security-john@gmail.com',
        password: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toHaveProperty('password');
      expect(JSON.stringify(res.body)).not.toContain('Password123!');
      expect(JSON.stringify(res.body)).not.toContain('$2a$'); // bcrypt prefix
    });

    it('✓ should never expose the hashed password on login responses', async () => {
      const password = 'SuperSecurePassword123!';
      const { user } = await createUser({ password });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toHaveProperty('password');
      expect(JSON.stringify(res.body)).not.toContain('$2a$');
    });

    it('✓ should never expose the hashed password on GET /api/auth/me responses', async () => {
      const { user, token } = await createUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toHaveProperty('password');
      expect(JSON.stringify(res.body)).not.toContain('$2a$');
    });
  });

  // ==========================================
  // 2. JWT SECRET NOT EXPOSED
  // ==========================================
  describe('JWT Secret Leakage Protection', () => {
    it('✓ should ensure that the JWT secret is never leaked in public endpoints', async () => {
      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      const resString = JSON.stringify(res.body);
      expect(resString).not.toContain(process.env.JWT_SECRET || 'test_jwt_secure_secret_key');
    });

    it('✓ should ensure that error stack traces and details do not leak secrets on failures', async () => {
      const res = await request(app).get('/api/non-existent-route-path');

      expect(res.statusCode).toBe(404);
      const resString = JSON.stringify(res.body);
      expect(resString).not.toContain(process.env.JWT_SECRET || 'test_jwt_secure_secret_key');
    });
  });

  // ==========================================
  // 3. PROTECTED ROUTES REQUIRE AUTHENTICATION
  // ==========================================
  describe('Authentication Gates', () => {
    it('✓ should block requests to protected user routes without an Authorization header', async () => {
      const res = await request(app).get('/api/profile/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide a valid Bearer authentication token');
    });

    it('✓ should block requests to protected routes with an invalid/expired token', async () => {
      const res = await request(app)
        .get('/api/profile/me')
        .set('Authorization', 'Bearer invalid-token-sig');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired token signature');
    });
  });

  // ==========================================
  // 4. ADMIN ROUTES REJECT NORMAL USERS
  // ==========================================
  describe('RBAC Authorization Gates', () => {
    it('✓ should reject access to admin endpoints for standard student users', async () => {
      const { token } = await createUser();

      const res = await request(securityApp)
        .get('/api/test-security-admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access Denied: Administrative permissions are required');
    });

    it('✓ should permit access to admin endpoints for authorized administrators', async () => {
      const { token } = await createAdmin();

      const res = await request(securityApp)
        .get('/api/test-security-admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Administrative access granted');
    });
  });

  // ==========================================
  // 5. INVALID JSON HANDLED SAFELY
  // ==========================================
  describe('Robust Input Handling', () => {
    it('✓ should return 400 Bad Request when receiving malformed JSON payload data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ "email": "malformed@gmail.com", "name": "Security John", "password": '); // Incomplete JSON string

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // ==========================================
    // 6. OVERSIZED PAYLOAD REJECTED
    // ==========================================
    it('✓ should reject requests with body sizes exceeding the safety cap (10KB)', async () => {
      const oversizedPayload = {
        name: 'Oversized User',
        email: 'oversized@gmail.com',
        largeData: 'x'.repeat(12 * 1024), // ~12KB payload
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(oversizedPayload);

      expect(res.statusCode).toBe(413); // Payload Too Large
    });

    // ==========================================
    // 7. MALFORMED REQUEST HANDLED
    // ==========================================
    it('✓ should safely catch malformed URLs (e.g. invalid URI encoding) without crashing the node process', async () => {
      const res = await request(app).get('/api/auth/%'); // % is malformed URL segment unless followed by hex codes

      // Handled as 400 Bad Request or 404 Route Not Found, but critically does not crash the server process
      expect(res.statusCode).toBeDefined();
      expect(res.body.success).toBe(false);
    });
  });
});
