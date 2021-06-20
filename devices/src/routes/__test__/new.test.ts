import request from 'supertest';
import { app } from '../../app';
import { Device } from '../../models/device';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/devices', async () => {
    const response = await request(app)
    .post('/api/devices')
    .send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if user is logged in', async () => {
    const response = await request(app)
    .post('/api/devices')
    .send({});

    expect(response.status).toEqual(401);
});

it('returns status different from 401 if user is signed in', async () => {
    const response = await request(app)
    .post('/api/devices')
    .set('Cookie', global.signin())
    .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if invalid serialNumber is provided', async () => {
    // Invalid SN
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', global.signin())
    .send({
        serialNumber: ''
    });

    expect(response.status).toEqual(400);

    // No SN
    response = await request(app)
    .post('/api/devices')
    .set('Cookie', global.signin())
    .send({});

    expect(response.status).toEqual(400);
});

it('creates a device with valid inputs', async () => {
    // Check DB for no tickets at the start of the test
    let devices = await Device.find({});
    expect(devices.length).toEqual(0);

    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', global.signin())
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });

    // After POST check for status code and new entry in DB
    expect(response.status).toEqual(201);
    devices = await Device.find({});
    expect(devices.length).toEqual(1);
    expect(devices[0].serialNumber).toEqual('AAAA-AAAA-AAAA');
});

it('returns an error if trying to create a device for an user that already has one', async () => {
    const cookie = global.signin();

    // Create the first device
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });
    expect(response.status).toEqual(201);

    // Create a second device for the same user
    response = await request(app)
    .post('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'BBBB-BBBB-BBBB'
    });
    expect(response.status).toEqual(400);

});

it('returns an error if trying to register a sarial number already in use', async () => {
    const cookie = global.signin();

    // Create the first device
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', global.signin())
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });
    expect(response.status).toEqual(201);

    // Create a second device for the same user
    response = await request(app)
    .post('/api/devices')
    .set('Cookie', global.signin())
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });
    expect(response.status).toEqual(400);

});

it('publishes an event', async () => {
    // Create a device
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', global.signin())
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });
    expect(response.status).toEqual(201);
    
    // Check for publish() function to be called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});