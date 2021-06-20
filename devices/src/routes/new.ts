import express, { Request, Response} from 'express';
import { BadRequestError, requireAuth, validateRequest } from '@lucasscola/meraki-selfservice';
import { body } from 'express-validator';
import { Device, DeviceDoc } from '../models/device';
import { GroupBlueprintMap } from '../types/group-blueprint-map';
import { DeviceCreatedPublisher } from '../events/publishers/device-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { getNextSubnet } from '../ip';

const findSubnet = async () => {
    // Get subnet for this record. Subnetting is incremental so the last used subnet is in the last DB entry
    const lastRecord = await Device.find().limit(1).sort({$natural:-1});

    let subnet: string | null;
    if (lastRecord && !lastRecord.length) {
        // Maybe this is the first entry, we use the supernet with correct prefix length
        subnet = process.env.SUPERNET!.split('/')[0] + '/' + process.env.PREFIX_LENGTH!;
        return subnet;
    }
    else {
        subnet = getNextSubnet(lastRecord[0].network.subnet, process.env.PREFIX_LENGTH!, process.env.SUPERNET!);
        return subnet;
    }
}

const recursiveSave = async (i: number, req: Request, blueprint: string): Promise<DeviceDoc> => {
    // Tries to find an available network until it can save the element in teh DB
    // This prevents errors that may apppear with simultaneos wrinting of entries with same subnet
    if (i > 10) {
        throw new BadRequestError('System may be too busy, please try again');
    }
    // Find new subnet
    const subnet = await findSubnet();
    if(!subnet) {
        throw new BadRequestError('Not able to add device. No subnets available');
    }

    // Create record
    const device = Device.build({
        serialNumber: req.body.serialNumber,
        userId: req.user!.id,
        userGroup: req.user!.group,
        userEmail: req.user!.email,
        network: {
            blueprint: blueprint,
            subnet: subnet
        }
    });

    try {
        // Try to save record in DB
        await device.save();
    }
    catch (err) {
        if (err.code === 11000) {
            // Duplicated subnet, someone just took it. Retry...
            return await recursiveSave(i++, req, blueprint);
        }
    }
    return device;
}


const router = express.Router();

router.post('/api/devices', requireAuth, [
    body('serialNumber').isLength({min:14, max:14}).withMessage('Serial number is required')
], validateRequest,
 async (req: Request, res: Response) => {
    const { serialNumber } = req.body;

    // Search record in DB, return if already exists: a device for the user, the SN is already in use
    const oldDevice = await Device.findOne({userId: req.user!.id});
    if (oldDevice) {
        throw new BadRequestError('Device already exists for the specified userId');
    };
    const otherSN = await Device.findOne({serialNumber: serialNumber});
    if (otherSN) {
        throw new BadRequestError('Serial Number is already registered');
    };


    // Get valid blueprint
    const blueprint = GroupBlueprintMap.get(req.user!.group);
    if (!blueprint) {
        throw new BadRequestError('No blueprint defined for current userGroup');
    };

    // Recursive save
    const device = await recursiveSave(1, req, blueprint);

    // Create event - Use data for device stored in DB just in case Mongoose does some presave modification
    // This will trigger Jobs service to upload changes to Meraki Cloud
    await new DeviceCreatedPublisher(natsWrapper.client).publish({
        id: device.id,
        serialNumber: device.serialNumber,
        userId: device.userId,
        userGroup: device.userGroup,
        userEmail: device.userEmail,
        network: {
            blueprint: device.network!.blueprint,
            subnet: device.network.subnet
        }
    });

    res.status(201).send(device);
});

export { router as createDeviceRouter};