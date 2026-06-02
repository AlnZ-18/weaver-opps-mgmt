const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Opportunity = require('../../models/Opportunity');
const User = require('../../models/User');

describe('🏁 AIESEC Opportunity Module: Sequential E2E Integration Scenario', () => {

  it('✓ should successfully execute the entire opportunity lifecycle flow from admin login to deletion', async () => {
    // ==========================================
    // Step 1: Login as Admin
    // ==========================================
    const adminEmail = 'e2e-opp-admin@gmail.com';
    const adminPassword = 'Password123!';
    const adminName = 'Opp E2E Administrator';

    // 1a. Register the admin user first
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.user.role).toBe('admin');

    // 1b. Login as admin to retrieve secure JWT token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    const adminToken = loginRes.body.token;
    expect(adminToken).toBeDefined();

    // ==========================================
    // Step 2: Create GTa (Global Talent) Opportunity
    // ==========================================
    const gtaPayload = {
      title: 'Global Talent Software Engineer',
      programType: 'GTa',
      country: 'Germany',
      city: 'Berlin',
      description: 'A premium front-end software engineering exchange opportunity.',
      stipend: '€1,500 EUR/month',
      duration: 12,
      skillsRequired: ['JavaScript', 'React'],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days in future
      status: 'Open',
    };

    const gtaRes = await request(app)
      .post('/api/opportunities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(gtaPayload);

    expect(gtaRes.statusCode).toBe(201);
    expect(gtaRes.body.success).toBe(true);
    const gtaOpportunityId = gtaRes.body.opportunity._id;
    expect(gtaOpportunityId).toBeDefined();
    expect(gtaRes.body.opportunity.programType).toBe('GTa');
    expect(gtaRes.body.opportunity.status).toBe('Open');

    // ==========================================
    // Step 3: Create GV (Global Volunteer) Opportunity
    // ==========================================
    const gvPayload = {
      title: 'Global Volunteer English Teacher',
      programType: 'GV',
      country: 'Brazil',
      city: 'São Paulo',
      description: 'A wonderful language volunteer program teaching school children.',
      stipend: 'Unpaid',
      duration: 6,
      skillsRequired: ['English Teaching', 'Communication'],
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days in future
      status: 'Open',
    };

    const gvRes = await request(app)
      .post('/api/opportunities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(gvPayload);

    expect(gvRes.statusCode).toBe(201);
    expect(gvRes.body.success).toBe(true);
    const gvOpportunityId = gvRes.body.opportunity._id;
    expect(gvOpportunityId).toBeDefined();
    expect(gvRes.body.opportunity.programType).toBe('GV');
    expect(gvRes.body.opportunity.status).toBe('Open');

    // ==========================================
    // Step 4: Close one opportunity (Close GTa)
    // ==========================================
    const closePayload = {
      ...gtaPayload,
      status: 'Closed',
    };

    const closeRes = await request(app)
      .put(`/api/opportunities/${gtaOpportunityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(closePayload);

    expect(closeRes.statusCode).toBe(200);
    expect(closeRes.body.success).toBe(true);
    expect(closeRes.body.opportunity.status).toBe('Closed');

    // ==========================================
    // Step 5: Fetch public opportunities
    // ==========================================
    const publicRes = await request(app)
      .get('/api/opportunities');

    expect(publicRes.statusCode).toBe(200);
    expect(publicRes.body.success).toBe(true);
    const publicOpps = publicRes.body.opportunities;
    expect(publicOpps).toBeDefined();

    // ==========================================
    // Step 6: Verify only Open opportunities returned
    // ==========================================
    // 6a. Closed GTa opportunity should NOT be present in public list
    const foundGta = publicOpps.find(opp => opp._id.toString() === gtaOpportunityId.toString());
    expect(foundGta).toBeUndefined();

    // 6b. Open GV opportunity SHOULD be present in public list
    const foundGv = publicOpps.find(opp => opp._id.toString() === gvOpportunityId.toString());
    expect(foundGv).toBeDefined();
    expect(foundGv.title).toBe(gvPayload.title);
    expect(foundGv.status).toBe('Open');

    // 6c. Verify all returned public opportunities are strictly "Open"
    publicOpps.forEach(opp => {
      expect(opp.status).toBe('Open');
    });

    // ==========================================
    // Step 7: Update opportunity (Update GV details)
    // ==========================================
    const updatePayload = {
      ...gvPayload,
      title: 'Global Volunteer English & IT Mentor',
      city: 'Rio de Janeiro',
    };

    const updateRes = await request(app)
      .put(`/api/opportunities/${gvOpportunityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.opportunity.title).toBe(updatePayload.title);
    expect(updateRes.body.opportunity.city).toBe(updatePayload.city);

    // Verify change persisted in DB
    const dbGvOpp = await Opportunity.findById(gvOpportunityId);
    expect(dbGvOpp.title).toBe(updatePayload.title);

    // ==========================================
    // Step 8: Delete opportunity (Delete GV and GTa)
    // ==========================================
    // 8a. Delete GV
    const deleteGvRes = await request(app)
      .delete(`/api/opportunities/${gvOpportunityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteGvRes.statusCode).toBe(200);
    expect(deleteGvRes.body.success).toBe(true);

    // 8b. Delete GTa
    const deleteGtaRes = await request(app)
      .delete(`/api/opportunities/${gtaOpportunityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteGtaRes.statusCode).toBe(200);
    expect(deleteGtaRes.body.success).toBe(true);

    // 8c. Verify database deletion
    const finalGv = await Opportunity.findById(gvOpportunityId);
    const finalGta = await Opportunity.findById(gtaOpportunityId);
    expect(finalGv).toBeNull();
    expect(finalGta).toBeNull();
  });
});
