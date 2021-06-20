import express, {Request,  Response} from 'express';
import { currentUser } from '@lucasscola/meraki-selfservice';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req: Request, res: Response) => {
    // currentUser middleware checks for logged user
    res.send({
        user: req.user || null 
    });
});

export { router as currentUserRouter };