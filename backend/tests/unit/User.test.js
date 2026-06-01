const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

describe('👤 User Model Unit Tests', () => {

  it('✓ should successfully create a new user document', async () => {
    const userData = {
      name: 'John Test',
      email: 'johntest@gmail.com',
      password: 'PlainPassword123!',
    };

    const user = await User.create(userData);

    expect(user).toBeDefined();
    expect(user).toHaveProperty('_id');
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });

  it('✓ should hash user passwords securely using bcrypt before saving to the database', async () => {
    const plainPassword = 'MySecretPassword123!';
    const userData = {
      name: 'Secure Hashed Doe',
      email: 'hasheddoe@gmail.com',
      password: plainPassword,
    };

    const user = await User.create(userData);

    // Fetch user directly from DB and explicitly select password to check the raw value
    const dbUser = await User.findById(user._id).select('+password');

    expect(dbUser.password).not.toBe(plainPassword); // Plain password must not be saved
    expect(dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$')).toBe(true); // Must be a valid bcrypt hash

    // Verify hash validity using bcrypt directly
    const isBcryptHash = await bcrypt.compare(plainPassword, dbUser.password);
    expect(isBcryptHash).toBe(true);
  });

  it('✓ should verify password correctness using comparePassword method', async () => {
    const plainPassword = 'CorrectPassword123!';
    const user = await User.create({
      name: 'Bcrypt Tester',
      email: 'bcrypttest@gmail.com',
      password: plainPassword,
    });

    const isMatch = await user.comparePassword(plainPassword);
    const isMiss = await user.comparePassword('WrongPassword123!');

    expect(isMatch).toBe(true);
    expect(isMiss).toBe(false);
  });

  it('✓ should sign a valid JSON Web Token containing the user ID using generateJWT method', async () => {
    const user = await User.create({
      name: 'JWT Signer',
      email: 'jwtsign@gmail.com',
      password: 'Password123!',
    });

    const token = user.generateJWT();

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    // Decode token and verify user ID payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_key');
    expect(decoded).toHaveProperty('id');
    expect(decoded.id).toBe(user._id.toString());
  });

  it('✓ should fail registration and throw a duplicate key error if email already exists', async () => {
    const sharedEmail = 'duplicate@gmail.com';
    
    // Create first user
    await User.create({
      name: 'First User',
      email: sharedEmail,
      password: 'Password123!',
    });

    // Create second user with same email (expects failure)
    let error;
    try {
      await User.create({
        name: 'Second User',
        email: sharedEmail,
        password: 'Password123!',
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    // Mongoose validates uniqueness and throws a duplicate key error (code 11000) or validation error
    expect(error.code === 11000 || error.name === 'ValidationError').toBe(true);
  });

  it('✓ should default the role field to "user" when not provided', async () => {
    const user = await User.create({
      name: 'Default Role Doe',
      email: 'defaultrole@gmail.com',
      password: 'Password123!',
    });

    expect(user.role).toBe('user'); // Enforces default "user" role
  });
});
