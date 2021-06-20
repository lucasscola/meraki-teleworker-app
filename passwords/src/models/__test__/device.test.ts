import mongoose from 'mongoose';
import { Device } from '../device';

it('implements OCC', async (done) => {
    // Create an instance of a device - add networkId
    const device = Device.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: 'user12345',
        userGroup: 'dummy-test',
        network: {blueprint: 'dummy-test'}
    });

    // Save device to DB
    await device.save();

    // Fetch device two times
    const firstInstance = await Device.findById(device.id);
    const secondInstance = await Device.findById(device.id);

    // Make a different change to each instance
    firstInstance.set({nework:{blueprint:'test'}});
    secondInstance.set({nework:{blueprint:'second'}});

    // Save one device - Should work
    await firstInstance.save();

    // Save second device - Has to fail because of outdated version number
    try {
        await secondInstance.save();
    } catch (error) {
        return done();
    }

    throw new Error('Should not reach this point');
    
});

it('increments version number on multiple saves', async () => {
    // Create an instance of a device
    const device = Device.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: 'user12345',
        userGroup: 'dummy-test',
        network: {blueprint: 'dummy-test'}
    });

    // Save device to DB
    await device.save();
    expect(device.version).toEqual(0);

    // Save again and check version
    await device.save();
    expect(device.version).toEqual(1);

    // And once again...
    await device.save();
    expect(device.version).toEqual(2);
});