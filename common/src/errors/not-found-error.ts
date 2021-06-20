import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
    statusCode = 404;
    constructor() {
        super('Route not found');
        // Extending built-in class
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serializeErrors() {
        return [{message: 'Error not found'}];
    };
}