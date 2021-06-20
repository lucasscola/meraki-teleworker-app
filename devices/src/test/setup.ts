import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(userId?: string): string[];
        }
    }
}

jest.mock('../nats-wrapper');
jest.mock('../types/group-blueprint-map');

let mongo: any;

// This function run before any test
beforeAll(async () => {
    // Inject test env
    process.env.JWT_KEY = 'asdfasdf';
    process.env.SUPERNET = '10.10.10.0/27';
    process.env.PREFIX_LENGTH = '29';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

// This function runs before each test
beforeEach(async () => {
    // Clear DB
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    };
    // Reset mock NATS wrapper object
    jest.clearAllMocks();
});

// This function runs after all tests
afterAll(async (done) => {
    await mongo.stop();
    await mongoose.connection.close();
    await done();
});

// Dummy Signin function to fake auth in tests
global.signin = (userId = undefined) => {
    // Check if userId is provided
    const id = userId ? userId : (new mongoose.Types.ObjectId().toHexString());
    // Build JWT payload
    const payload = {
        id: id, 
        email: 'test@test.com',
        group: 'dummy-test'
    };

    // Create JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Bulid session object
    const session = { jwt: token };

    // Turn session into JSON
    const sessionJSON = JSON.stringify(session);

    // Encode JSON in Base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return string ase the cookie
    return [`express:sess=${base64}`];
}