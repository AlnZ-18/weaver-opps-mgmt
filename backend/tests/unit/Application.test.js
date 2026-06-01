const mongoose = require('mongoose');
const Application = require('../../models/Application');
const { createUser, createAdmin, createOpportunity } = require('../utils/factories');

describe('📋 Application Model Unit Tests', () => {
  it('✓ should successfully create a new application document with valid fields', async () => {
    const { user } = await createUser();
    const { admin } = await createAdmin();
    const opportunity = await createOpportunity(admin._id);

    const appData = {
      userId: user._id,
      opportunityId: opportunity._id,
      status: 'Applied',
    };

    const application = await Application.create(appData);

    expect(application).toBeDefined();
    expect(application.userId.toString()).toBe(user._id.toString());
    expect(application.opportunityId.toString()).toBe(opportunity._id.toString());
    expect(application.status).toBe('Applied');
  });

  it('✓ should default status to Applied if not specified', async () => {
    const { user } = await createUser();
    const { admin } = await createAdmin();
    const opportunity = await createOpportunity(admin._id);

    const application = await Application.create({
      userId: user._id,
      opportunityId: opportunity._id,
    });

    expect(application.status).toBe('Applied');
  });

  it('✓ should reject invalid status values', async () => {
    const { user } = await createUser();
    const { admin } = await createAdmin();
    const opportunity = await createOpportunity(admin._id);

    let error;
    try {
      await Application.create({
        userId: user._id,
        opportunityId: opportunity._id,
        status: 'InvalidStatusName',
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.status.message).toContain('is not a valid exchange application status');
  });

  it('✓ should enforce compound unique constraint on userId and opportunityId', async () => {
    const { user } = await createUser();
    const { admin } = await createAdmin();
    const opportunity = await createOpportunity(admin._id);

    // Create first application
    await Application.create({
      userId: user._id,
      opportunityId: opportunity._id,
    });

    // Attempt duplicate creation
    let error;
    try {
      await Application.create({
        userId: user._id,
        opportunityId: opportunity._id,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB index duplicate error code
  });

  it('✓ should automatically generate timestamps', async () => {
    const { user } = await createUser();
    const { admin } = await createAdmin();
    const opportunity = await createOpportunity(admin._id);

    const application = await Application.create({
      userId: user._id,
      opportunityId: opportunity._id,
    });

    expect(application.createdAt).toBeDefined();
    expect(application.updatedAt).toBeDefined();
    expect(application.createdAt instanceof Date).toBe(true);
  });
});
