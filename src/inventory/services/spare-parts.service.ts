import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SparePart } from '../schemas/spare-part.schema';

@Injectable()
export class SparePartsService {
    constructor(
        @InjectModel(SparePart.name)
        private readonly sparePartModel: Model<SparePart>,
    ) { }

    // Crear repuesto
    async create(data: Partial<SparePart>): Promise<SparePart> {
        const created = new this.sparePartModel(data);
        return created.save();
    }

    // Obtener todos
    async findAll(): Promise<SparePart[]> {
        return this.sparePartModel.find().exec();
    }

    // Obtener por ID
    async findOne(id: string): Promise<SparePart> {
        const sparePart = await this.sparePartModel.findById(id).exec();
        if (!sparePart) {
            throw new NotFoundException(`SparePart with id ${id} not found`);
        }
        return sparePart;
    }

    // Actualizar
    async update(id: string, data: Partial<SparePart>): Promise<SparePart> {
        const updated = await this.sparePartModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();

        if (!updated) {
            throw new NotFoundException(`SparePart with id ${id} not found`);
        }

        return updated;
    }

    // Eliminar (soft delete usando active)
    async remove(id: string): Promise<SparePart> {
        const deleted = await this.sparePartModel
            .findByIdAndDelete(id)
            .exec();

        if (!deleted) {
            throw new NotFoundException(`SparePart with id ${id} not found`);
        }

        return deleted;
    }
}