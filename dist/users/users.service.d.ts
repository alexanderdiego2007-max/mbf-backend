import { Model } from 'mongoose';
import { User } from './user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    findOne(username: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    deleteUser(id: string): Promise<void>;
    validateUser(username: string, password: string): Promise<any>;
    create(name: string, lastname: string, company: string, doc: string, position: string, username: string, password: string, confirmPassword: string, check: number, role: string, address?: string, phone?: string): Promise<User>;
    updateUser(id: string, updateData: Partial<User>): Promise<User | null>;
    findByEmail(username: string): Promise<User | null>;
    findTechnicians(): Promise<User[]>;
}
