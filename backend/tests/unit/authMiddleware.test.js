const jwt = require('jsonwebtoken');
const { authenticateUser, authorizeAdmin } = require('../../middleware/authMiddleware');
const { createUser, createAdmin } = require('../utils/factories');
const { AppError } = require('../../middleware/errorMiddleware');

describe('🛡️ Authentication Middleware Unit Tests', () => {
  let req;
  let res;
  let next;

  // Reset Express mock request/response parameters before each test case
  beforeEach(() => {
    req = {
      headers: {},
      user: undefined,
    };
    res = {};
    next = jest.fn();
  });

  // ==========================================
  // 1. authenticateUser MIDDLEWARE TESTS
  // ==========================================
  describe('authenticateUser', () => {
    it('✓ should accept a valid JWT token and attach user model context to req.user', async () => {
      const { user, token } = await createUser();
      req.headers.authorization = `Bearer ${token}`;

      await authenticateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(); // Expect next() to be called with no arguments (success)
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(req.user.email).toBe(user.email);
    });

    it('✓ should reject expired JWT tokens and forward a 401 AppError', async () => {
      const { user } = await createUser();
      // Generate a token that is instantly expired (expiresIn: '0s' or negative value)
      const expiredToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'default_jwt_secret_key',
        { expiresIn: '0s' }
      );
      
      req.headers.authorization = `Bearer ${expiredToken}`;

      await authenticateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorPassed = next.mock.calls[0][0];
      expect(errorPassed.statusCode).toBe(401);
      expect(errorPassed.message).toContain('expired');
    });

    it('✓ should reject malformed JWT tokens and forward a 401 AppError', async () => {
      req.headers.authorization = 'Bearer invalid.malformed.tokenstring';

      await authenticateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorPassed = next.mock.calls[0][0];
      expect(errorPassed.statusCode).toBe(401);
      expect(errorPassed.message).toContain('Invalid or expired token signature');
    });

    it('✓ should reject requests with missing token headers and forward a 401 AppError', async () => {
      req.headers.authorization = undefined; // No Authorization header present

      await authenticateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorPassed = next.mock.calls[0][0];
      expect(errorPassed.statusCode).toBe(401);
      expect(errorPassed.message).toContain('Please provide a valid Bearer authentication token');
    });
  });

  // ==========================================
  // 2. authorizeAdmin MIDDLEWARE TESTS
  // ==========================================
  describe('authorizeAdmin', () => {
    it('✓ should allow access when req.user role is admin', () => {
      req.user = {
        role: 'admin',
      };

      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(); // Access granted
    });

    it('✓ should deny access and forward a 403 AppError when req.user role is user', () => {
      req.user = {
        role: 'user',
      };

      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorPassed = next.mock.calls[0][0];
      expect(errorPassed.statusCode).toBe(403);
      expect(errorPassed.message).toContain('Administrative permissions are required');
    });

    it('✓ should deny access and forward a 500 AppError when no authenticated user context exists (anonymous)', () => {
      req.user = undefined; // No user preloaded by authenticateUser

      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorPassed = next.mock.calls[0][0];
      expect(errorPassed.statusCode).toBe(500);
      expect(errorPassed.message).toContain('User identity context was not found');
    });
  });
});
