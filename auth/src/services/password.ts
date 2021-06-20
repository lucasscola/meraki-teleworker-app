import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// Convert scrypt from callback based to promise based
const scryptAsync = promisify(scrypt);

export class Password {
    // Static methods are accesible without instanciating an Object
    static async toHash(password: string,) {
        const salt = randomBytes(8).toString('hex');
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;

        return `${buf.toString('hex')}.${salt}`;
    };

    static async compare(storedPassword: string, suppliedPassword: string) {
        const [hashedPassword, salt] = storedPassword.split('.');
        // Hash supplied password
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

        return buf.toString('hex') === hashedPassword;
    };
}