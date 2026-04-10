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

@Controller('spare-parts')
export class SparePartsController {

    // Crear repuesto
    @Post()
    create(@Body() data: any) {
        return {
            message: 'Repuesto creado correctamente',
            data,
        };
    }

    // Listar con filtros
    @Get()
    findAll(@Query() query: any) {
        return {
            message: 'Listado de repuestos',
            filters: query,
        };
    }

    // Obtener uno
    @Get(':id')
    findOne(@Param('id') id: string) {
        return {
            message: 'Detalle del repuesto',
            id,
        };
    }

    // Actualizar
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return {
            message: 'Repuesto actualizado',
            id,
            data,
        };
    }

    // Eliminar (soft delete recomendado luego)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return {
            message: 'Repuesto eliminado',
            id,
        };
    }
}
