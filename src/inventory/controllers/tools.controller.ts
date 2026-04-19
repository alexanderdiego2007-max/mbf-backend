import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete
} from '@nestjs/common';
import { ToolsService } from '../services/tools.service';

@Controller('tools')
export class ToolsController {

    constructor(private readonly toolsService: ToolsService) { }

    // Crear herramienta
    @Post()
    create(@Body() body: any) {
        return this.toolsService.create(body);
    }

    // Listar herramientas
    @Get()
    findAll() {
        return this.toolsService.findAll();
    }

    // Obtener una
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.toolsService.findOne(id);
    }

    // Actualizar
    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.toolsService.update(id, body);
    }

    // Eliminar
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.toolsService.remove(id);
    }
}
