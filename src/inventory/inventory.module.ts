import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory, InventorySchema } from './inventory.schema';
import { SparePartsController } from './controllers/spare-parts.controller';
import { SparePart, SparePartSchema } from './schemas/spare-part.schema';
import { SparePartsService } from './services/spare-parts.service';
import { ToolsController } from './controllers/tools.controller';
import { ToolsService } from './services/tools.service';
import { Tool, ToolSchema } from './schemas/tool.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema }, { name: SparePart.name, schema: SparePartSchema }, { name: Tool.name, schema: ToolSchema }, //ESTE ES EL QUE FALTABA

    ]),
  ],
  controllers: [InventoryController, SparePartsController, ToolsController],
  providers: [InventoryService, SparePartsService, ToolsService],
})
export class InventoryModule { }
