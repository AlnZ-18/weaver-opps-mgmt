const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Opportunity = require('../../models/Opportunity');
const { createUser, createAdmin, createOpportunity } = require('../utils/factories');

describe('📋 Opportunity CRUD API Integration Tests', () => {

  // ==========================================
  // 1. CREATE OPPORTUNITY (POST /api/opportunities)
  // ==========================================
  describe('POST /api/opportunities', () => {
    it('✓ should allow an authenticated admin to successfully create an opportunity placement', async () => {
      const { admin, token } = await createAdmin();

      const opportunityPayload = {
        title: 'Global Talent Software Engineer',
        programType: 'GTa',
        country: 'Japan',
        city: 'Tokyo',
        description: 'A premium exchange opportunity working with front-end systems.',
        stipend: '¥300,000 JPY/month',
        duration: 24,
        skillsRequired: ['React', 'TypeScript'],
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send(opportunityPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('successfully');
      expect(res.body.opportunity).toBeDefined();
      expect(res.body.opportunity.title).toBe(opportunityPayload.title);
      expect(res.body.opportunity.programType).toBe(opportunityPayload.programType);
      expect(res.body.opportunity.createdBy.toString()).toBe(admin._id.toString());

      // Verify persistence in DB
      const dbOpportunity = await Opportunity.findById(res.body.opportunity._id);
      expect(dbOpportunity).toBeDefined();
      expect(dbOpportunity.title).toBe(opportunityPayload.title);
    });

    it('✓ should reject opportunity creation if the user is a standard student user', async () => {
      const { token } = await createUser();

      const opportunityPayload = {
        title: 'Global Volunteer Educator',
        programType: 'GV',
        country: 'Brazil',
        city: 'Rio',
        description: 'A volunteer program focusing on sustainable English teaching.',
        stipend: 'Unpaid',
        duration: 6,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send(opportunityPayload);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Administrative permissions are required');
    });

    it('✓ should reject opportunity creation if required fields are missing', async () => {
      const { token } = await createAdmin();

      // Missing title, programType and country
      const incompletePayload = {
        city: 'Rio',
        description: 'A volunteer program.',
        stipend: 'Unpaid',
        duration: 6,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send(incompletePayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide an opportunity title');
    });

    it('✓ should reject opportunity creation if an invalid programType is supplied', async () => {
      const { token } = await createAdmin();

      const invalidPayload = {
        title: 'Invalid Program Exchange',
        programType: 'GTx', // Invalid programType (not GTa or GV)
        country: 'Germany',
        city: 'Munich',
        description: 'An invalid opportunity.',
        stipend: 'Paid',
        duration: 12,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exchange program type is invalid');
    });

    it('✓ should reject opportunity creation if duration is less than 2 weeks', async () => {
      const { token } = await createAdmin();

      const invalidPayload = {
        title: 'Short Exchange',
        programType: 'GV',
        country: 'Germany',
        city: 'Munich',
        description: 'An invalid opportunity.',
        stipend: 'Paid',
        duration: 1, // Under 2 weeks limit
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duration must be at least 2 weeks');
    });
  });

  // ==========================================
  // 2. UPDATE OPPORTUNITY (PUT /api/opportunities/:id)
  // ==========================================
  describe('PUT /api/opportunities/:id', () => {
    it('✓ should allow an authenticated admin to successfully update an opportunity', async () => {
      const { admin, token } = await createAdmin();
      const opportunity = await createOpportunity(admin._id, { title: 'Old Title' });

      const updatePayload = {
        title: 'New Dynamic Title',
        programType: 'GV',
        country: 'India',
        city: 'Amaravati',
        description: 'Updated volunteer description.',
        stipend: 'Unpaid',
        duration: 8,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .put(`/api/opportunities/${opportunity._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('updated successfully');
      expect(res.body.opportunity.title).toBe(updatePayload.title);
      expect(res.body.opportunity.programType).toBe(updatePayload.programType);
      expect(res.body.opportunity.city).toBe(updatePayload.city);

      // Verify DB update
      const updatedDbOpportunity = await Opportunity.findById(opportunity._id);
      expect(updatedDbOpportunity.title).toBe(updatePayload.title);
    });

    it('✓ should reject opportunity update if user is not an admin', async () => {
      const { admin } = await createAdmin();
      const { token } = await createUser();
      const opportunity = await createOpportunity(admin._id);

      const res = await request(app)
        .put(`/api/opportunities/${opportunity._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Standard Student Hacking Title' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('✓ should return 404 when updating an opportunity that does not exist', async () => {
      const { token } = await createAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();

      const updatePayload = {
        title: 'Hacked Title',
        programType: 'GTa',
        country: 'USA',
        city: 'Austin',
        description: 'Does not exist.',
        stipend: '$500 USD/month',
        duration: 10,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .put(`/api/opportunities/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No exchange opportunity was found');
    });
  });

  // ==========================================
  // 3. DELETE OPPORTUNITY (DELETE /api/opportunities/:id)
  // ==========================================
  describe('DELETE /api/opportunities/:id', () => {
    it('✓ should allow an authenticated admin to successfully delete an opportunity', async () => {
      const { admin, token } = await createAdmin();
      const opportunity = await createOpportunity(admin._id);

      const res = await request(app)
        .delete(`/api/opportunities/${opportunity._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      // Verify deletion in DB
      const deletedDbOpportunity = await Opportunity.findById(opportunity._id);
      expect(deletedDbOpportunity).toBeNull();
    });

    it('✓ should reject opportunity deletion if user is not an admin', async () => {
      const { admin } = await createAdmin();
      const { token } = await createUser();
      const opportunity = await createOpportunity(admin._id);

      const res = await request(app)
        .delete(`/api/opportunities/${opportunity._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('✓ should return 404 when deleting an opportunity that does not exist', async () => {
      const { token } = await createAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/opportunities/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 4. GET ADMIN ALL (GET /api/opportunities/admin/all)
  // ==========================================
  describe('GET /api/opportunities/admin/all', () => {
    it('✓ should allow an authenticated admin to successfully fetch all listings', async () => {
      const { admin, token } = await createAdmin();
      await createOpportunity(admin._id, { title: 'First Opportunity' });
      await createOpportunity(admin._id, { title: 'Second Opportunity' });

      const res = await request(app)
        .get('/api/opportunities/admin/all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
      expect(res.body.opportunities).toBeDefined();
      expect(res.body.opportunities[0].createdBy).toHaveProperty('name');
    });

    it('✓ should reject fetching admin opportunities for standard student users', async () => {
      const { token } = await createUser();

      const res = await request(app)
        .get('/api/opportunities/admin/all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 5. PUBLIC OPPORTUNITIES RETRIEVAL
  // ==========================================
  describe('Public Opportunity GET API Endpoints', () => {
    it('✓ should allow anyone (unauthenticated) to fetch open opportunities with pagination and sorting', async () => {
      const { admin } = await createAdmin();
      // Seed open and closed opportunities
      await createOpportunity(admin._id, { title: 'Open Talent 1', status: 'Open' });
      await createOpportunity(admin._id, { title: 'Open Talent 2', status: 'Open' });
      await createOpportunity(admin._id, { title: 'Closed Volunteer', status: 'Closed' });

      const res = await request(app)
        .get('/api/opportunities')
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.opportunities).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);

      // Verify only 'Open' opportunities are returned
      res.body.opportunities.forEach((opp) => {
        expect(opp.status).toBe('Open');
      });
    });

    it('✓ should filter public opportunities by programType if specified', async () => {
      const { admin } = await createAdmin();
      await createOpportunity(admin._id, { title: 'Open GTa Placement', programType: 'GTa', status: 'Open' });
      await createOpportunity(admin._id, { title: 'Open GV Placement', programType: 'GV', status: 'Open' });

      const res = await request(app)
        .get('/api/opportunities')
        .query({ programType: 'GTa' });

      expect(res.statusCode).toBe(200);
      expect(res.body.opportunities.length).toBeGreaterThanOrEqual(1);
      res.body.opportunities.forEach((opp) => {
        expect(opp.programType).toBe('GTa');
      });
    });

    it('✓ should allow anyone to fetch a single opportunity\'s full details', async () => {
      const { admin } = await createAdmin();
      const opportunity = await createOpportunity(admin._id, { title: 'Full Details Placement' });

      const res = await request(app)
        .get(`/api/opportunities/${opportunity._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.opportunity).toBeDefined();
      expect(res.body.opportunity.title).toBe('Full Details Placement');
      expect(res.body.opportunity.createdBy.name).toBe(admin.name);
    });

    it('✓ should return 404 when querying an opportunity details that does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/opportunities/${nonExistentId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
