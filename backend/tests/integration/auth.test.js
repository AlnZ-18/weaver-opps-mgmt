const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createUser } = require('../utils/factories');

describe('🔑 Authentication Integration API Tests', () => {
  
  describe('POST /api/auth/register', () => {
    it('should successfully register a new standard user', async () => {
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
      expect(res.body.user).not.toHaveProperty('password');

      // Verify record is committed in database
      const dbUser = await User.findOne({ email: payload.email });
      expect(dbUser).toBeDefined();
      expect(dbUser.role).toBe('user'); // Default role
    });

    it('should reject registration payloads missing required fields', async () => {
      const payload = {
        email: 'invalid-user@gmail.com', // Missing name and password
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration if email address is already taken', async () => {
      // Pre-spawn user in memory db via factory
      const existingEmail = 'duplicate@gmail.com';
      await createUser({ email: existingEmail });

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
  });

  describe('POST /api/auth/login', () => {
    it('should successfully authenticate registered credentials', async () => {
      const password = 'SecretPassword123!';
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

    it('should reject incorrect passwords', async () => {
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
  });

  describe('GET /api/auth/me', () => {
    it('should retrieve active account profile when Bearer JWT is passed', async () => {
      const { user, token } = await createUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email', user.email);
      expect(res.body.user).toHaveProperty('name', user.name);
    });

    it('should reject request with 401 when no token is present', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide a valid Bearer authentication token');
    });
  });
});
