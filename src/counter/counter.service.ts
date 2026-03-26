import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel('Counter')
    private counterModel: Model<any>,
  ) {}

  // Obtener siguiente consecutivo (REAL - incrementa)
  async getNextSequence(name: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { name },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    return counter.seq;
  }

  // 🔹 Obtener siguiente consecutivo (PREVIEW - NO incrementa)
  async getNextPreview(name: string): Promise<number> {
    const counter = await this.counterModel.findOne({ name });
    return (counter?.seq || 0) + 1;
  }
}