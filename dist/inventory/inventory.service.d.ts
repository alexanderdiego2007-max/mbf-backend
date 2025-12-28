import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from './inventory.schema';
export declare class InventoryService {
    private inventoryModel;
    constructor(inventoryModel: Model<InventoryDocument>);
    create(data: Partial<Inventory>): Promise<Inventory>;
    generatePDF(inventory: any): Promise<Buffer>;
    findAll(): Promise<Inventory[]>;
    findOne(id: string): Promise<Inventory>;
    update(id: string, data: Partial<Inventory>): Promise<Inventory>;
    delete(id: string): Promise<Inventory>;
}
