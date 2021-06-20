import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@lucasscola/meraki-selfservice';
import { authenticate } from '../services/local-authenticate';


const router = express.Router();

router.post('/api/users/signin', 
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Please supply a password')
    ], 
    validateRequest, 
    authenticate,
    async (req: Request, res: Response) => { 
        res.status(201).send(req.user);
    }
);

export { router as signinRouter };