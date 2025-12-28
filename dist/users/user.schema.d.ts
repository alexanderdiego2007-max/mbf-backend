import { Schema, Document } from 'mongoose';
export declare const UserSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    username: string;
    name: string;
    password: string;
    lastname: string;
    company: string;
    doc: string;
    position: string;
    confirmPassword: string;
    check: string;
    role: string;
    resetPasswordCode?: number;
    resetPasswordExpires?: NativeDate;
    address?: string;
    phone?: string;
}, Document<unknown, {}, import("mongoose").FlatRecord<{
    username: string;
    name: string;
    password: string;
    lastname: string;
    company: string;
    doc: string;
    position: string;
    confirmPassword: string;
    check: string;
    role: string;
    resetPasswordCode?: number;
    resetPasswordExpires?: NativeDate;
    address?: string;
    phone?: string;
}>, {}> & import("mongoose").FlatRecord<{
    username: string;
    name: string;
    password: string;
    lastname: string;
    company: string;
    doc: string;
    position: string;
    confirmPassword: string;
    check: string;
    role: string;
    resetPasswordCode?: number;
    resetPasswordExpires?: NativeDate;
    address?: string;
    phone?: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export interface User extends Document {
    id: string;
    name: string;
    lastname: string;
    company: string;
    doc: string;
    position: string;
    username: string;
    password: string;
    confirmPassword: string;
    check: number;
    resetPasswordCode?: number | null;
    resetPasswordExpires?: Date | null;
    role: string;
    address?: string;
    phone?: string;
}
