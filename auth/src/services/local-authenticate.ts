import passport from 'passport';
import { Strategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { Password } from './password';
import { BadRequestError, NotAuthorizedError } from '@lucasscola/meraki-selfservice';
// import { BadRequestError, NotFoundError } from '@lucasscola/meraki-selfservice';

// Extend Express user interface for TS
declare global {
    namespace Express {
        interface User {
            id?: string;
        }
    }
};

// Setting up Passport
// Change credential types to ask for "email" and "password
const authFields = {
    usernameField: 'email',
    passwordField: 'password'
};

passport.use(new Strategy(
    authFields,
    async (email, password, done) => {
    const user = await User.findOne({email});
    if (!user) {
        return done(null, false, {message: 'Username does not exist'});
    }
    // Check password
    const passwordMatch = await Password.compare(user.password, password);
    if (!passwordMatch) {
        return done(null, false, {message: 'Wrong password'});
    }
    // Everything match, returns user
    return done(null, user, {message: 'Logged in successfully'});
}))

// Serialize and deserialize
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
        return done(null, user);
});

// Authenticate middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', {session: false}, (errors, user, info) => {
        if (errors) {     
            console.log('Error');    
            return next(new NotAuthorizedError());
        }
        if (!user) {  
            return next(new BadRequestError("Invalid username or password"));
        }
        
        // Generate and return session
        // - Generate JTW 
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email,
            group: user.group
        }, process.env.JWT_KEY! // Exclamation to ignore TS undefined error (ENV already checked at startup)
        );
        // - Store it on a session. Differs from doc because of TS
        req.session = {
            jwt: userJwt
        };
        req.user = user;

        return next();
    })(req, res, next);
};

export { passport, authenticate };