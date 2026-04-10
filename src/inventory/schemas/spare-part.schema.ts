import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SparePartDocument = SparePart & Document;

@Schema({ timestamps: true })
export class SparePart {

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    category: string;

    @Prop({ default: 0 })
    stock: number;

    @Prop({ default: 0 })
    minStock: number;

    @Prop()
    location: string;

    @Prop({
        enum: ['available', 'low', 'out', 'inactive'],
        default: 'available',
    })
    status: string;

    @Prop({ default: true })
    active: boolean;
}

export const SparePartSchema = SchemaFactory.createForClass(SparePart);
