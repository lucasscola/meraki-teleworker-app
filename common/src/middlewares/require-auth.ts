import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';

// This middleware runs ONLY AFTER currentUser
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is logged in
    if (!req.user) {
        throw new NotAuthorizedError();
    };
    next();
}