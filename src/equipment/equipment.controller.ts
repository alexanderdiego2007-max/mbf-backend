/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
  Res,
  HttpException,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EquipmentService } from './equipment.service';
import { Equipment } from './equipment.schema';
import { Response, Request } from 'express';

// Extend the Request interface to include the 'user' property
declare module 'express' {
  interface Request {
    user?: { name: string; role: string };
  }
}

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly service: EquipmentService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photoInitial', maxCount: 2 },
      { name: 'photoFinal', maxCount: 2 },
      { name: 'invoice', maxCount: 1 },
    ]),
  )
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photoInitial', maxCount: 2 },
      { name: 'photoFinal', maxCount: 2 },
      { name: 'invoice', maxCount: 1 },
    ]),
  )
  async create(
    @Body() data: Partial<Equipment>,
    @UploadedFiles()
    files: {
      photoInitial?: Express.Multer.File[];
      photoFinal?: Express.Multer.File[];
      invoice?: Express.Multer.File[];
    },
  ): Promise<Equipment> {
    try {
      const initialPhotos = files.photoInitial || [];
      const finalPhotos = files.photoFinal || [];
      const invoice = files.invoice?.[0] || null;

      return await this.service.create(
        { ...data },
        initialPhotos,
        finalPhotos,
        invoice,
      );

    } catch (error) {
      throw new HttpException(
        `Error al crear el equipo: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  @Get()
  async findAll(
    @Query('technicianName') technicianName?: string,
    @Query('email') email?: string
  ): Promise<Equipment[]> {
    // Si se envía un email, buscar por email del cliente
    if (email) {
      return this.service.findByEmail(email);
    }

    // Si se envía el nombre del técnico, buscar por técnico asignado
    if (technicianName) {
      return this.service.findByTechnician(technicianName);
    }

    // Si no se envía ningún filtro, devolver todos los equipos
    return this.service.findAll();
  }



  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Equipment> {
    return this.service.findOne(id);
  }

  @Get(':id/photos')
  async getPhotos(@Param('id') id: string, @Res() res: Response) {
    try {
      const photos = await this.service.getPhotos(id);

      if (
        !photos ||
        (!photos.photoInitial?.length && !photos.photoFinal?.length)
      ) {
        return res.status(404).json({ message: 'Fotos no encontradas.' });
      }

      res.json({
        initial: photos.photoInitial?.map(p => p.toString('base64')) || [],
        final: photos.photoFinal?.map(p => p.toString('base64')) || [],
      });

    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las fotos.' });
    }
  }



  @Get(':id/invoice')
  async getInvoice(@Param('id') id: string, @Res() res: Response) {
    try {
      const base64Invoice = await this.service.getInvoice(id);
      res.json({ invoice: base64Invoice });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photoInitial', maxCount: 2 },
      { name: 'photoFinal', maxCount: 2 },
      { name: 'invoice', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Equipment>,
    @UploadedFiles()
    files: {
      photoInitial?: Express.Multer.File[];
      photoFinal?: Express.Multer.File[];
      invoice?: Express.Multer.File[];
    },
  ): Promise<Equipment> {
    try {
      const initialPhotos = files.photoInitial || [];
      const finalPhotos = files.photoFinal || [];
      const invoice = files.invoice?.[0] || null;

      return await this.service.update(
        id,
        {
          ...data,
          authorizationDate: data.authorizationDate
            ? new Date(data.authorizationDate)
            : undefined,
          deliveryDate: data.deliveryDate
            ? new Date(data.deliveryDate)
            : undefined,
        },
        initialPhotos,
        finalPhotos,
        invoice,
      );
    } catch (error) {
      throw new HttpException(
        `Error al actualizar el equipo: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }

  @Patch(':id/photo')
  async deletePhoto(
    @Param('id') id: string,
    @Body('type') type: "initial" | "final",
    @Body('photoBase64') photoBase64: string,
  ) {
    try {
      const updatedEquipment = await this.service.removePhoto(
        id,
        type,
        photoBase64,
      );

      return {
        message: 'Foto eliminada correctamente',
        equipment: updatedEquipment,
      };

    } catch (error) {
      throw new HttpException(
        `Error al eliminar la foto: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Get('generate-pdf/:id')
  async generatePDF(@Param('id') id: string, @Res() res: Response) {
    try {
      const equipment = await this.service.findOne(id);
      if (!equipment) {
        throw new HttpException(
          'Inventario no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      const pdfBuffer = await this.service.generatePDF(equipment);
      const base64PDF = pdfBuffer.toString('base64');

      res.status(HttpStatus.OK).json({
        message: 'PDF generado correctamente',
        base64: base64PDF,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id/customer-approval')
  async updateCustomerApproval(
    @Param('id') id: string,
    @Body('approval') approval: string,
  ): Promise<Equipment> {
    return this.service.updateCustomerApproval(id, approval);
  }

}
