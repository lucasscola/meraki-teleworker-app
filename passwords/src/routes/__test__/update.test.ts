import request from 'supertest';
import mongoose from 'mongoose';
import { Device } from '../../models/device';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if device is not found', async () => {
    const response = await request(app)
    .put(`/api/passwords`)
    .set('Cookie', global.signin())
    .send({
        newPassword: 'testPassword'
    });

    expect(response.status).toEqual(404);
});

it('returns 401 if user not authenticated', async () => {
    const response = await request(app)
    .put(`/api/passwords`)
    .send({
        newPassword: 'testPassword'
    });

    expect(response.status).toEqual(401);
});

it('updates password if everything is valid', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.signin(userId);
    // Create device
    const device = Device.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        userGroup: 'dummy-test',
        network: {blueprint: 'dummy-test'}
    });
    // Update the device with fake networkId
    device.set({network:{networkId: 'ABCDasdf'}});
    await device.save();

    // Update device password
    const response = await request(app)
    .put('/api/passwords')
    .set('Cookie', cookie)
    .send({
        newPassword: 'testPassword',
    });

    expect(response.status).toEqual(204);
});

it('publishes an event', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.signin(userId);
    // Create device
    const device = Device.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        userGroup: 'dummy-test',
        network: {blueprint: 'dummy-test'}
    });
    // Update the device with fake networkId
    device.set({network:{networkId: 'ABCDasdf'}});
    await device.save();

    // Update device password
    const response = await request(app)
    .put('/api/passwords')
    .set('Cookie', cookie)
    .send({
        newPassword: 'testPassword',
    });

    expect(response.status).toEqual(204);

    // Check for publish() function to be called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});