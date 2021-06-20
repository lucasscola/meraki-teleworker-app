import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    reason = 'Error connecting to database';
    
    constructor(public message: string) {
        super(message);

        // Extending built-in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    };

    serializeErrors() {
        return [{message: this.reason}];
    };
};