import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ToolDocument = Tool & Document;

@Schema({ timestamps: true })
export class Tool {

    @Prop({ required: true })
    nombre: string;

    @Prop()
    categoria: string;

    @Prop({ default: 'Disponible' })
    estadoUso: string;

    @Prop()
    ubicacion: string;

    @Prop()
    responsable: string;

    @Prop()
    observaciones: string;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
