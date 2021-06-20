import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';

// This middleware runs ONLY AFTER currentUser
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is logged in
    if (!req.user) {
        throw new NotAuthorizedError();
    };
    // If user does not belong to group Administrator then reject (local auth only)
    if (req.user.group != 'administrators') {
        throw new NotAuthorizedError();
    }
    next();
}