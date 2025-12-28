import { Model } from 'mongoose';
import { Equipment, EquipmentDocument } from './equipment.schema';
import { User } from 'src/users/user.schema';
import { ConfigService } from '@nestjs/config';
export declare class EquipmentService {
    private equipmentModel;
    private userModel;
    private readonly configService;
    private twilioClient;
    constructor(equipmentModel: Model<EquipmentDocument>, userModel: Model<User>, configService: ConfigService);
    create(data: Partial<Equipment>, photos?: Express.Multer.File[], invoice?: Express.Multer.File): Promise<Equipment>;
    findAll(): Promise<Equipment[]>;
    findByTechnician(technicianId: string): Promise<Equipment[]>;
    findByEmail(email: string): Promise<Equipment[]>;
    findOne(id: string): Promise<Equipment>;
    getPhotos(id: string): Promise<Buffer[]>;
    getInvoice(id: string): Promise<string>;
    update(id: string, rawData: Partial<Equipment>, photos?: Express.Multer.File[], invoice?: Express.Multer.File): Promise<Equipment>;
    updateCustomerApproval(id: string, approval: string): Promise<Equipment>;
    delete(id: string): Promise<void>;
    removePhoto(id: string, photoUrl: string): Promise<Equipment>;
    generatePDF(equipment: any): Promise<Buffer>;
}
