import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@lucasscola/meraki-selfservice';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters long'),
    body('group')
        .isString()
        .withMessage('Must include a group')
], validateRequest,
async (req: Request, res: Response) => {
    const { email, password, group } = req.body;
    // Check for email already in use
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new BadRequestError('Email already in use');
    };

    // Create new user
    const user = User.build({email, password, group});
    await user.save();

    // User created. Return session information 
    // - Generate JTW 
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email,
        group: user.group
    }, process.env.JWT_KEY!, // Exclamation to ignore TS undefined error (ENV already checked at startup)
    {
        expiresIn: '24h'
    });
    // - Store it on a session. Differs from doc because of TS
    req.session = {
        jwt: userJwt
    };

    res.status(201).send(user);

    
});

export { router as signupRouter };