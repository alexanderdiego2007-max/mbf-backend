import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterSchema } from './counter.schema';
import { CounterService } from './counter.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Counter', schema: CounterSchema },
    ]),
  ],
  providers: [CounterService],
  exports: [CounterService], // IMPORTANTE para usarlo en otros módulos
})
export class CounterModule {}