import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ToolDocument = Tool & Document;

@Schema({ timestamps: true })
export class Tool {

    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true, unique: true })
    referencia: string;

    @Prop()
    descripcion: string;

    // INVENTARIO
    @Prop({ default: 'Unidad' })
    unidad: string;

    @Prop({ default: 'Principal' })
    bodega: string;

    // PRECIOS
    @Prop({ required: true })
    precio: number; // precio total

    @Prop()
    precioBase: number;

    @Prop({ default: 0 })
    impuesto: number;

    // STOCK
    @Prop({ default: 0 })
    cantidad: number;

    @Prop()
    costoUnidad: number;

    // CONTROL
    @Prop({ default: 'Almacén' })
    responsable: string;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);