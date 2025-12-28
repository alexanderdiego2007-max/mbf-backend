import { InventoryService } from './inventory.service';
import { Inventory } from './inventory.schema';
import { Response } from 'express';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(createDto: Partial<Inventory>): Promise<Inventory>;
    findAll(): Promise<Inventory[]>;
    findOne(id: string): Promise<Inventory>;
    update(id: string, updateDto: Partial<Inventory>): Promise<Inventory>;
    delete(id: string): Promise<Inventory>;
    generateQR(id: string, res: Response): Promise<void>;
    generatePDF(id: string, res: Response): Promise<void>;
}
