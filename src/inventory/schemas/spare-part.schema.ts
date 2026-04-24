import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SparePartDocument = SparePart & Document;

@Schema({ timestamps: true })
export class SparePart {

    @Prop({ required: true })
    name: string;

    @Prop({ enum: ['producto', 'servicio'], required: true })
    type: string;

    @Prop({ default: 'Unidad' })
    unit: string;

    @Prop({ required: true })
    price: number;

    @Prop({ default: 0 })
    tax: number;

    @Prop({ required: true })
    totalPrice: number;

    @Prop()
    description: string;

    // SOLO PRODUCTO
    @Prop()
    location: string;

    @Prop({ default: 0 })
    stock: number;

    @Prop({ default: 0 })
    cost: number;
}

export const SparePartSchema = SchemaFactory.createForClass(SparePart);
