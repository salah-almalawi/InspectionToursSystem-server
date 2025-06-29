const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const Auth = require('../models/auth');

let app;
let mongoServer;
let token;
let adminToken;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    app = require('../app');
    await new Promise((res) => mongoose.connection.once('open', res));
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

async function setupAdmin() {
    const hashed = await bcrypt.hash('adminpass', 10);
    await Auth.create({ username: 'admin', password: hashed });
    const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'adminpass' });
    adminToken = res.body.token;
}


describe('Authentication', () => {

    beforeEach(async () => {
        await setupAdmin();
    });
    test('register', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username: 'user1', password: 'pass123' });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });

    test('login', async () => {
        await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username: 'user2', password: 'pass123' });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'user2', password: 'pass123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('logout', async () => {
        const res = await request(app).post('/api/auth/logout');
        expect(res.status).toBe(200);
    });
});

describe('Manager CRUD', () => {
    beforeEach(async () => {
          await setupAdmin();
        const res = await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username: 'cruduser', password: 'pass123' });
        token = res.body.token;
    });

    test('create, list, get, update, delete manager', async () => {
        const createRes = await request(app)
            .post('/api/managers')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Manager', rank: 1, department: 'Dept' });
        expect(createRes.status).toBe(201);
        const id = createRes.body._id;

        const listRes = await request(app)
            .get('/api/managers')
            .set('Authorization', `Bearer ${token}`);
        expect(listRes.status).toBe(200);
        expect(Array.isArray(listRes.body)).toBe(true);

        const getRes = await request(app)
            .get(`/api/managers/${id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body._id).toBe(id);

        const updateRes = await request(app)
            .put(`/api/managers/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated' });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.name).toBe('Updated');

        const deleteRes = await request(app)
            .delete(`/api/managers/${id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(deleteRes.status).toBe(200);
    });
});

describe('Inspection rounds', () => {
    beforeEach(async () => {
      await setupAdmin();
        const res = await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username: 'rounduser', password: 'pass123' });
        token = res.body.token;
    });

    test('create and retrieve round', async () => {
        const mgrRes = await request(app)
            .post('/api/managers')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'RoundMgr', rank: 2, department: 'Dept' });
        const managerId = mgrRes.body._id;

        const createRes = await request(app)
            .post('/api/rounds')
            .set('Authorization', `Bearer ${token}`)
            .send({ managerId, location: 'Loc', day: 'Mon' });
        expect(createRes.status).toBe(201);
        const roundId = createRes.body._id;

        const listRes = await request(app)
            .get('/api/rounds')
            .set('Authorization', `Bearer ${token}`);
        expect(listRes.status).toBe(200);
        expect(Array.isArray(listRes.body)).toBe(true);

        const getRes = await request(app)
            .get(`/api/rounds/${roundId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body._id).toBe(roundId);
    });
});

describe('Authorization', () => {
    test('request without token', async () => {
        const res = await request(app).get('/api/managers');
        expect(res.status).toBe(401);
    });

    test('request with invalid token', async () => {
        const res = await request(app)
            .get('/api/managers')
            .set('Authorization', 'Bearer invalid');
        expect(res.status).toBe(401);
    });
});