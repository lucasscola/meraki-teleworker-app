import request from 'supertest';
import mongoose from 'mongoose';
import { Device } from '../../models/device';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if device is not found', async () => {
    const response = await request(app)
    .put(`/api/devices`)
    .set('Cookie', global.signin())
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });

    expect(response.status).toEqual(404);
});

it('returns 401 if user not authenticated', async () => {
    const response = await request(app)
    .put(`/api/devices`)
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });

    expect(response.status).toEqual(401);
});


it('returns 400 if invalid serial number', async () => {
    // Create device
    const cookie = global.signin();
    let response = await request(app)
    .put('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'AAAA-AAAA-AAAA',
    });
    // Update device with no SN
    response = await request(app)
    .put(`/api/devices`)
    .set('Cookie', cookie)
    .send({});

    expect(response.status).toEqual(400);

    // Update device with invalid SN
    response = await request(app)
    .put(`/api/devices`)
    .set('Cookie', cookie)
    .send({
        serialNumber: ''
    });

    expect(response.status).toEqual(400);
});

it('returns 400 if trying to update before uploading', async () => {
    const cookie = global.signin();
    // Create device
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'AAAA-AAAA-AAAA',
    });
    // Update device
    response = await request(app)
    .put('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'BBBB-BBBB-BBBB',
    });

    expect(response.status).toEqual(400);
});

it('updates device if valid serial number is provided', async () => {
    const cookie = global.signin();
    // Create device
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'AAAA-AAAA-AAAA',
    });
    expect(response.status).toEqual(201);
    // Get into DB and update the device with fake networkId
    const device = await Device.findOne({serialNumber: 'AAAA-AAAA-AAAA'});
    device.set({network:{networkId: 'ABCDasdf'}});
    await device.save();

    // Update device
    response = await request(app)
    .put('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'BBBB-BBBB-BBBB',
    });

    expect(response.status).toEqual(200);
});

it('publishes an event', async () => {
    const cookie = global.signin();
    // Create a device
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });
    
    // Get into DB and update the device with fake networkId
    const device = await Device.findOne({serialNumber: 'AAAA-AAAA-AAAA'});
    device.set({network:{networkId: 'ABCDasdf'}});
    await device.save();

    // Update device
    response = await request(app)
    .put('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'BBBB-BBBB-BBBB',
    });
    expect(response.status).toEqual(200);

    // Check for publish() function to be called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});