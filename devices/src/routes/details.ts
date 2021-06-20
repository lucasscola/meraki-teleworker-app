import express, { Request, Response} from 'express';
import { requireAuth } from '@lucasscola/meraki-selfservice';
import { Device } from '../models/device';
import { NotFoundError } from '@lucasscola/meraki-selfservice';

const router = express.Router();

router.get('/api/devices/details', requireAuth,
 async (req: Request, res: Response) => {
    // Search record in DB and extract Meraki networkId
    const device = await Device.findOne({userId: req.user!.id});
    if (!device) {
        throw new NotFoundError();
    }
    const networkId = device.network.networkId;

    // Send a request to Meraki API to get network details

    // Return details   
    res.send(networkId);
});

export { router as detailsDeviceRouter};