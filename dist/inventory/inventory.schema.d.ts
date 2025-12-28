import { Document } from 'mongoose';
export type InventoryDocument = Inventory & Document;
export declare class Inventory {
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
    location: string;
    purchaseDate: Date;
    voltage: string;
    power: string;
    weight: string;
    capacity: string;
    material: string;
    usage: string;
    technology: string;
    maintenancePriority: string;
    FT: String;
}
export declare const InventorySchema: import("mongoose").Schema<Inventory, import("mongoose").Model<Inventory, any, any, any, Document<unknown, any, Inventory, any> & Inventory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Inventory, Document<unknown, {}, import("mongoose").FlatRecord<Inventory>, {}> & import("mongoose").FlatRecord<Inventory> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
