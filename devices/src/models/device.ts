import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { GroupBlueprintMap } from '../types/group-blueprint-map';

// Interface to describe properties required to create a new Device for TypeScript
interface DeviceAttrs {
    serialNumber: string,
    userId: string,
    userGroup: string,
    userEmail: string,
    network: {
        blueprint: string,
        subnet: string
    }
};

// Interface for describing properties of the Device Document in MongoDB (a single object in the DB)
export interface DeviceDoc extends mongoose.Document {
    serialNumber: string,
    network: {
        networkId?: string,
        blueprint: string,
        subnet: string
    }, 
    userId: string,
    userGroup: string,
    userEmail: string,
    previousSerialNumber: string,
    merakiRegistered: Date,
    version: number,
}

// Interface for describing new properties of the Device Model
interface DeviceModel extends mongoose.Model<DeviceDoc> {
    build (attrs: DeviceAttrs): DeviceDoc;
};


// MongoDB schema definition
const deviceSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true
    },
    network: {
        networkId: {
            type: String,
        },
        blueprint: {
            type: String,
            enum: Array.from(GroupBlueprintMap.values())
        },
        subnet: {
            type: String,
            required: true,
            unique: true
        },
    },
    userId: {
        type: String,
        required: true
    },
    userGroup: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    previousSerialNumber: {
        type: String,
    },
    merakiRegistered: {
        type: mongoose.Schema.Types.Date,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;   
        }
    }
});

// Setting up version key and Optimistic Concurrency Control
deviceSchema.set('versionKey', 'version');
deviceSchema.plugin(updateIfCurrentPlugin);

deviceSchema.statics.build = (attrs: DeviceAttrs) => {
    return new Device(attrs);
}

const Device = mongoose.model<DeviceDoc, DeviceModel>('Device', deviceSchema);


export { Device };