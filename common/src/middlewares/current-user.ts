import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface UserPayload to describe info in JWT for TS
interface UserPayload {
    id: string;
    email: string;
    group: string;
};

declare global {
    namespace Express {
        interface User {
            id?: string,
            email: string,
            group: string
        }
    }
};

// Extend Request type with userSession information, so TS doesn't throw any errors
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
};

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    // If any check fails, this midlleware will return user=null in req
    // Check if cookie is present
    if (!req.session?.jwt){
        return next();
    }
    // Chek if JWT is valid
    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
        req.user = payload;
    } catch (err) {
        res.send({currentUser: null});
    }

    next();
};
