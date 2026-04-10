import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    Query,
} from '@nestjs/common';
import { SparePartsService } from '../services/spare-parts.service';

@Controller('spare-parts')
export class SparePartsController {

    constructor(private readonly sparePartsService: SparePartsService) { }

    //  Crear repuesto REAL
    @Post()
    create(@Body() data: any) {
        return this.sparePartsService.create(data);
    }

    //  Listar reales
    @Get()
    findAll(@Query() query: any) {
        return this.sparePartsService.findAll();
    }

    //  Obtener uno
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sparePartsService.findOne(id);
    }

    //  Actualizar
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return this.sparePartsService.update(id, data);
    }

    //  Eliminar (soft delete)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.sparePartsService.remove(id);
    }
}