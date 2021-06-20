import express, { Request, Response} from 'express';
import { requireAuth } from '@lucasscola/meraki-selfservice';
import { Device } from '../models/device';

const router = express.Router();

router.get('/api/devices',
    requireAuth, 
    async (req: Request, res: Response) => {
    // Returns user device details
    const device = await Device.findOne({userId: req.user!.id});
    res.send(device);
    }
);

export { router as indexDeviceRouter};