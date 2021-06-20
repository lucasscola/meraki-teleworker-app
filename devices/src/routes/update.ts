import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { Device } from '../models/device';
import { validateRequest, NotFoundError, requireAuth, BadRequestError } from '@lucasscola/meraki-selfservice';
import { DeviceUpdatedPublisher } from '../events/publishers/device-updated-publisher';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

router.put('/api/devices', requireAuth, [
    body('serialNumber').isLength({min:14, max:14}).withMessage('Serial number is required')
], validateRequest,
async (req: Request, res: Response) => {
    // Search record in DB
    const device = await Device.findOne({userId: req.user!.id});

    // Check if device exists
    if (!device) {
        throw new NotFoundError();
    }

    // The device should already be available on Meraki Cloud in order allow edition
    if (!device.network.networkId) {
        throw new BadRequestError('Please wait until device is registered on Meraki before making any changes');
    }

    // Update the device
    device.set({
        serialNumber: req.body.serialNumber,
        previousSerialNumber: device.serialNumber,
    });
    await device.save();
    
    // Emits an event - Use data for ticket stored in DB just in case Mongoose does some presave modification
    // This will trigger Jobs service to upload changes to Meraki Cloud
     await new DeviceUpdatedPublisher(natsWrapper.client).publish({
         id: device.id,
         version: device.version,
         serialNumber: device.serialNumber,
         userId: device.userId,
         userGroup: device.userGroup,
         network: {
             blueprint: device.network.blueprint,
             networkId: device.network.networkId,
             subnet: device.network.subnet
         },
    });

    res.send(device);
});

export { router as updateDeviceRouter};