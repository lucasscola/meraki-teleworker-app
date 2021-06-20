import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { Device } from '../models/device';
import { validateRequest, NotFoundError, requireAuth, BadRequestError } from '@lucasscola/meraki-selfservice';
import { PasswordUpdatedPublisher } from '../events/publishers/password-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/passwords', requireAuth, [
    body('newPassword').not().isEmpty().withMessage('Please provide a new password')
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

    // Emit an event for updated password
    // This will create a Job to update it on Meraki Cloud
    await new PasswordUpdatedPublisher(natsWrapper.client).publish({
        networkId: device.network.networkId,
        newPassword: req.body.newPassword,
    })    

    res.status(204).send({});
});

export { router as updatePasswordRouter};