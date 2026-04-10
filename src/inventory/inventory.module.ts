import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory, InventorySchema } from './inventory.schema';
import { SparePartsController } from './controllers/spare-parts.controller';
import { SparePart, SparePartSchema } from './schemas/spare-part.schema';
import { SparePartsService } from './services/spare-parts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema }, { name: SparePart.name, schema: SparePartSchema },
    ]),
  ],
  controllers: [InventoryController, SparePartsController],
  providers: [InventoryService, SparePartsService],
})
export class InventoryModule { }
