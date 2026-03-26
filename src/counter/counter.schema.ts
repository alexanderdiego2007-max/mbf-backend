import { Schema, Document } from 'mongoose';

export interface Counter extends Document {
  name: string;
  seq: number;
}

export const CounterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});