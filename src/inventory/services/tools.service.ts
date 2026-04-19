import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tool, ToolDocument } from '../schemas/tool.schema';

@Injectable()
export class ToolsService {

    constructor(
        @InjectModel(Tool.name) private toolModel: Model<ToolDocument>
    ) { }

    // Crear
    async create(data: Partial<Tool>) {
        const tool = new this.toolModel(data);
        return tool.save();
    }

    // Listar todos
    async findAll() {
        return this.toolModel.find().sort({ createdAt: -1 });
    }

    // Buscar uno
    async findOne(id: string) {
        const tool = await this.toolModel.findById(id);

        if (!tool) {
            throw new NotFoundException('Herramienta no encontrada');
        }

        return tool;
    }

    // Actualizar
    async update(id: string, data: Partial<Tool>) {
        const tool = await this.toolModel.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );

        if (!tool) {
            throw new NotFoundException('Herramienta no encontrada');
        }

        return tool;
    }

    // Eliminar
    async remove(id: string) {
        const tool = await this.toolModel.findByIdAndDelete(id);

        if (!tool) {
            throw new NotFoundException('Herramienta no encontrada');
        }

        return { message: 'Herramienta eliminada correctamente' };
    }
}
