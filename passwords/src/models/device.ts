import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { GroupBlueprintMap } from '../types/group-blueprint-map';

// Interface to describe properties required to create a new Device for TypeScript
interface DeviceAttrs {
    id: string,
    userId: string,
    userGroup: string,
    network: {blueprint: string}
};

// Interface for describing properties of the Device Document in MongoDB (a single object in the DB)
interface DeviceDoc extends mongoose.Document {
    network: {
        networkId?: string,
        blueprint: string,
    }, 
    userId: string,
    userGroup: string,
    version: number,

}

// Interface for describing new properties of the Device Model
interface DeviceModel extends mongoose.Model<DeviceDoc> {
    build (attrs: DeviceAttrs): DeviceDoc;
    // findIfPreviousVersion search for a ticket only if the version is the previous one, for concurrency control
    findIfPreviousVersion(event: {id: string, version: number}): Promise<DeviceDoc | null>;
};


// MongoDB schema definition
const deviceSchema = new mongoose.Schema({
    network: {
        networkId: {
            type: String,
        },
        blueprint: {
            type: String,
            enum: Array.from(GroupBlueprintMap.values())
        }
    },
    userId: {
        type: String,
        required: true
    },
    userGroup: {
        type: String,
        required: true
    },
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
    return new Device({
        _id: attrs.id,
        userId: attrs.userId,
        userGroup: attrs.userGroup,
        network: attrs.network
    });
};

deviceSchema.statics.findIfPreviousVersion = (event: {id: string, version: number}) => {
    return Device.findOne({
        _id: event.id,
        version: event.version -1
    });
}

const Device = mongoose.model<DeviceDoc, DeviceModel>('Device', deviceSchema);


export { Device };