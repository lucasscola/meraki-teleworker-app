import { CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
    statusCode = 401;
    constructor() {
        super('Not authorized');
        // Extending built-in class
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }
    serializeErrors() {
        return [{message: 'Not authorized'}];
    };
}