import mongoose from 'mongoose';
import { Password } from '../services/password';

// Interface to describe properties required to create a new User for TypeScript
interface UserAttrs {
    email: string,
    password: string,
    group: string
};

// Interface for describing properties of the User Model
interface UserModel extends mongoose.Model<UserDoc> {
    build (attrs: UserAttrs): UserDoc;
};

// Interface for describing properties of the User Document in MongoDB (a single object in the DB)
interface UserDoc extends mongoose.Document {
    email: string,
    password: string,
    group: string
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        group: {
            type: String,
            required: true
        },
    }, 
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;   
        }
    }
});

// Hashing password before saving users
userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    };
    // Callback to notify mongoose that async funtions finished
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

//const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);


export { User };