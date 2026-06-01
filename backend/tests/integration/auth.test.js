const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');
const { createUser } = require('../utils/factories');

describe('🔑 AIESEC Opportunity Portal: Authentication API Tests', () => {

  // ==========================================
  // 1. REGISTER ENDPOINT TESTS
  // ==========================================
  describe('POST /api/auth/register', () => {
    it('✓ should successfully register a standard user with valid credentials', async () => {
      const payload = {
        name: 'Jane Doe',
        email: 'janedoe@gmail.com',
        password: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('name', payload.name);
      expect(res.body.user).toHaveProperty('email', payload.email);
      expect(res.body.user).toHaveProperty('role', 'user');
      expect(res.body.user).not.toHaveProperty('password');

      // Verify user exists in database
      const dbUser = await User.findOne({ email: payload.email });
      expect(dbUser).toBeDefined();
    });

    it('✓ should reject registration if email is already registered', async () => {
      const existingEmail = 'duplicate@gmail.com';
      await createUser({ email: existingEmail }); // Pre-seed in memory DB

      const payload = {
        name: 'Duplicate Guy',
        email: existingEmail,
        password: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('✓ should reject registration if email is missing', async () => {
      const payload = {
        name: 'No Email Doe',
        password: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('valid email address');
    });

    it('✓ should reject registration if password is missing', async () => {
      const payload = {
        name: 'No Password Doe',
        email: 'nopassword@gmail.com',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('secure password');
    });

    it('✓ should reject registration if email format is invalid', async () => {
      const payload = {
        name: 'Bad Email Doe',
        email: 'invalid-email-format', // Missing domain / TLD
        password: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('valid email address');
    });

    it('✓ should reject registration if password length is too short', async () => {
      const payload = {
        name: 'Short Password Doe',
        email: 'shortpass@gmail.com',
        password: '12345', // Under 6 characters
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 6 characters long');
    });
  });

  // ==========================================
  // 2. LOGIN ENDPOINT TESTS
  // ==========================================
  describe('POST /api/auth/login', () => {
    it('✓ should successfully authenticate with registered credentials', async () => {
      const password = 'CorrectPassword123!';
      const { user } = await createUser({ password });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', user.email);
    });

    it('✓ should reject authentication when password is wrong', async () => {
      const { user } = await createUser({ password: 'CorrectPassword123!' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'IncorrectPassword123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('✓ should reject authentication when email is unknown', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown-user-email@gmail.com',
          password: 'SomePassword123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('✓ should reject authentication when credentials are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: '', // Empty fields
          password: '',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('valid email address');
    });
  });

  // ==========================================
  // 3. JWT TOKEN VERIFICATION TESTS
  // ==========================================
  describe('JWT Validation & Protected Routes', () => {
    it('✓ should successfully generate a token on valid login', async () => {
      const password = 'SecretPassword123!';
      const { user } = await createUser({ password });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(10);
    });

    it('✓ should ensure that the generated JWT token contains the correct user ID in its payload', async () => {
      const { user, token } = await createUser();

      // Decode and verify the token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_key');
      
      expect(decoded).toHaveProperty('id');
      expect(decoded.id).toBe(user._id.toString());
    });

    it('✓ should grant access to protected route GET /api/auth/me when a valid Bearer token is provided', async () => {
      const { user, token } = await createUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email', user.email);
    });

    it('✓ should deny access to protected route GET /api/auth/me when token is missing', async () => {
      const res = await request(app)
        .get('/api/auth/me'); // No Authorization Header

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide a valid Bearer authentication token');
    });
  });
});
