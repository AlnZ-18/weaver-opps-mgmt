const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Opportunity = require('../../models/Opportunity');
const { createAdmin, createOpportunity } = require('../utils/factories');

describe('📋 Public Opportunity GET API Integration Tests', () => {

  // ==========================================
  // 1. GET /api/opportunities
  // ==========================================
  describe('GET /api/opportunities', () => {
    it('✓ returns only Open opportunities', async () => {
      const { admin } = await createAdmin();
      // Seed opportunities
      await createOpportunity(admin._id, { title: 'Open Opportunity 1', status: 'Open' });
      await createOpportunity(admin._id, { title: 'Open Opportunity 2', status: 'Open' });
      await createOpportunity(admin._id, { title: 'Closed Placement', status: 'Closed' });

      const res = await request(app)
        .get('/api/opportunities');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.opportunities.length).toBeGreaterThanOrEqual(2);

      // Verify all items are strictly Open
      res.body.opportunities.forEach((opp) => {
        expect(opp.status).toBe('Open');
      });
    });

    it('✓ Closed opportunities hidden', async () => {
      const { admin } = await createAdmin();
      const closedOpp = await createOpportunity(admin._id, { title: 'Secret Closed Opportunity', status: 'Closed' });

      const res = await request(app)
        .get('/api/opportunities');

      expect(res.statusCode).toBe(200);
      
      // Confirm that the closed opportunity is hidden and not present in response
      const closedFound = res.body.opportunities.find((opp) => opp._id.toString() === closedOpp._id.toString());
      expect(closedFound).toBeUndefined();
    });

    it('✓ pagination works', async () => {
      const { admin } = await createAdmin();
      // Seed multiple opportunities (order: 3, then 2, then 1)
      const opp1 = await createOpportunity(admin._id, { title: 'Oldest', status: 'Open' });
      const opp2 = await createOpportunity(admin._id, { title: 'Middle', status: 'Open' });
      const opp3 = await createOpportunity(admin._id, { title: 'Latest', status: 'Open' });

      // Request second page, limit 1 (should return opp2 - the middle one)
      const res = await request(app)
        .get('/api/opportunities')
        .query({ page: 2, limit: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.opportunities.length).toBe(1);
      expect(res.body.opportunities[0].title).toBe('Middle'); // Middle is the 2nd latest
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('✓ empty list handled', async () => {
      // Clear all opportunities in database first for isolated empty check
      await Opportunity.deleteMany({});

      const res = await request(app)
        .get('/api/opportunities');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.opportunities).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  // ==========================================
  // 2. GET /api/opportunities/:id
  // ==========================================
  describe('GET /api/opportunities/:id', () => {
    it('✓ valid opportunity returned', async () => {
      const { admin } = await createAdmin();
      const opportunity = await createOpportunity(admin._id, { title: 'Detailed Public Exchange Placement' });

      const res = await request(app)
        .get(`/api/opportunities/${opportunity._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.opportunity).toBeDefined();
      expect(res.body.opportunity.title).toBe('Detailed Public Exchange Placement');
      expect(res.body.opportunity.createdBy.name).toBe(admin.name);
    });

    it('✓ invalid id handled', async () => {
      // Send a completely invalid CastError-triggering non-ObjectID string
      const res = await request(app)
        .get('/api/opportunities/completely-invalid-id-format');

      // Intercepted cleanly by our centralized errorMiddleware as a 400 Bad Request
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid resource identifier');
    });

    it('✓ deleted opportunity handled', async () => {
      const { admin } = await createAdmin();
      const opportunity = await createOpportunity(admin._id);

      // Delete the opportunity to simulate deletion
      await Opportunity.findByIdAndDelete(opportunity._id);

      // Hit the endpoint with the deleted ID
      const res = await request(app)
        .get(`/api/opportunities/${opportunity._id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No exchange opportunity was found');
    });
  });
});
