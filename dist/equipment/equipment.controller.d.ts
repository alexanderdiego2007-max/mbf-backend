import { EquipmentService } from './equipment.service';
import { Equipment } from './equipment.schema';
import { Response } from 'express';
declare module 'express' {
    interface Request {
        user?: {
            name: string;
            role: string;
        };
    }
}
export declare class EquipmentController {
    private readonly service;
    constructor(service: EquipmentService);
    create(data: Partial<Equipment>, files: {
        photo_0?: Express.Multer.File[];
        photo_1?: Express.Multer.File[];
        photo_2?: Express.Multer.File[];
        invoice?: Express.Multer.File[];
    }): Promise<Equipment>;
    findAll(technicianName?: string, email?: string): Promise<Equipment[]>;
    findOne(id: string): Promise<Equipment>;
    getPhotos(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getInvoice(id: string, res: Response): Promise<void>;
    update(id: string, data: Partial<Equipment>, files: {
        photo_0?: Express.Multer.File[];
        photo_1?: Express.Multer.File[];
        photo_2?: Express.Multer.File[];
        invoice?: Express.Multer.File[];
    }): Promise<Equipment>;
    delete(id: string): Promise<void>;
    deletePhoto(id: string, photoUrl: string): Promise<{
        message: string;
        equipment: Equipment;
    }>;
    generatePDF(id: string, res: Response): Promise<void>;
    updateCustomerApproval(id: string, approval: string): Promise<Equipment>;
}
