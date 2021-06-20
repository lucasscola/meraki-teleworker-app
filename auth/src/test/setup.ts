import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
    namespace NodeJS {
        interface Global {
            signin(): Promise<string[]>;
        }
    }
}

let mongo: any;

jest.mock('../services/sso-authenticate');

// This function run before any test
beforeAll(async () => {
    // Inject a JWT_KEY in test env
    process.env.JWT_KEY = 'asdfasdf';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

// This function runs before each test
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    };
});

// This function runs after all tests
afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = async () => {
    const email = 'test@test.com';
    const password = 'password';
    const group = 'it';

    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email, password, group
    })
    .expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
}