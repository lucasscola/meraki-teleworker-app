import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { passport, getUserGroups } from '../services/sso-authenticate';
import { BadRequestError } from '@lucasscola/meraki-selfservice';

const router = express.Router();

router.get('/api/users/sso-signin', 
    passport.authenticate('oauth-bearer', {session: false}),
    async (req: Request, res: Response) => {
        // Check for user field in req (should exist if passed authentication)
        if (!req.user) {
            throw new BadRequestError('User not defined');
        }

        // Get user group from Azure AD. This steps requires on-behalf-of token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new BadRequestError('Unable to find token to get User groups');
        }
        const [groups, err] = await getUserGroups(authHeader);
        if(err) {
            throw new BadRequestError(err);
        }
        const groupId = groups[0].id;
            
        // - Generate JTW 
        const userJwt = jwt.sign({
            id: req.user.id,
            email: req.user.email,
            group: groupId,
        }, process.env.JWT_KEY!, // Exclamation to ignore TS undefined error (ENV already checked at startup)
        {
            expiresIn: '24h'
        });
        // - Store it on a session. Differs from doc because of TS
        req.session = {
            jwt: userJwt
        };
        res.status(200).send(req.user);
    }
);

export { router as ssoSigninRouter };