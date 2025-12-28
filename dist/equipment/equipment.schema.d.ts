import mongoose, { Document } from 'mongoose';
export type EquipmentDocument = Equipment & Document;
export declare class Equipment {
    name: string;
    brand: string;
    model: string;
    serial: string;
    issue: string;
    photos: Buffer[];
    invoice: string | Buffer;
    assignedTechnician: mongoose.Types.ObjectId;
    technicalDataSheet?: string;
    diagnosis: string;
    customerApproval: string;
    authorizationDate?: Date;
    deliveryDate?: Date;
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    address?: string;
    userId?: string;
    doc?: string;
    company?: string;
    username?: string;
}
export declare const EquipmentSchema: mongoose.Schema<Equipment, mongoose.Model<Equipment, any, any, any, mongoose.Document<unknown, any, Equipment, any> & Equipment & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Equipment, mongoose.Document<unknown, {}, mongoose.FlatRecord<Equipment>, {}> & mongoose.FlatRecord<Equipment> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
