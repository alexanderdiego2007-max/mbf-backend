/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Equipment, EquipmentDocument } from './equipment.schema';
import * as PDFDocument from 'pdfkit';
import { join } from 'path';
import { User } from 'src/users/user.schema';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EquipmentService {
  private twilioClient: Twilio;

  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<EquipmentDocument>,
    @InjectModel('User') private userModel: Model<User>,
    private readonly configService: ConfigService, // inyectamos ConfigService
  ) {
    this.twilioClient = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  // Crear un nuevo equipo con fotos y factura
  async create(
    data: Partial<Equipment>,
    photoInitial?: Express.Multer.File[],
    photoFinal?: Express.Multer.File[],
    invoice?: Express.Multer.File,
  ): Promise<Equipment> {
    const initialBuffers = photoInitial?.map(f => f.buffer) || [];
    const finalBuffers = photoFinal?.map(f => f.buffer) || [];

    const newEquipment = new this.equipmentModel({
      ...data,
      photoInitial: initialBuffers,
      photoFinal: finalBuffers,
      invoice: invoice?.buffer || null,
    });

    return newEquipment.save();
  }


  // Obtener todos los equipos
  async findAll(): Promise<Equipment[]> {
    const equipments = await this.equipmentModel
      .find()
      .populate('assignedTechnician', 'name username phone') // <-- técnico expandido
      .exec();

    return equipments.map((equipment) => ({
      ...equipment.toObject(),
      invoice: equipment.invoice
        ? equipment.invoice.toString('base64') // Convertir factura a Base64
        : null,
    }));
  }

  async findByTechnician(technicianId: string): Promise<Equipment[]> {
    const equipments = await this.equipmentModel
      .find({ assignedTechnician: new mongoose.Types.ObjectId(technicianId) })
      .populate('assignedTechnician', 'name username phone')
      .exec();

    return equipments.map((equipment) => ({
      ...equipment.toObject(),
      invoice: equipment.invoice
        ? equipment.invoice.toString('base64')
        : null,
    }));
  }



  // Obtener equipos por correo del cliente
  async findByEmail(email: string): Promise<Equipment[]> {
    const equipments = await this.equipmentModel
      .find({ email }) // Asegúrate de que el campo se llama "email" en el modelo
      .exec();

    return equipments.map((equipment) => ({
      ...equipment.toObject(),
      invoice: equipment.invoice
        ? equipment.invoice.toString('base64') // Convertir factura a Base64
        : null,
    }));
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentModel
      .findById(id)
      .populate('assignedTechnician', 'name username phone') // <-- técnico expandido
      .exec();

    if (!equipment) {
      throw new NotFoundException('Equipo no encontrado');
    }

    return {
      ...equipment.toObject(),
      invoice: equipment.invoice
        ? equipment.invoice.toString('base64')
        : null,
    };
  }

  async getPhotos(id: string) {
    const equipment = await this.equipmentModel.findById(id).exec();

    if (!equipment) {
      throw new NotFoundException('Photos not found');
    }

    return {
      photoInitial: equipment.photoInitial || [],
      photoFinal: equipment.photoFinal || [],
    };
  }


  async getInvoice(id: string): Promise<string> {
    const equipment = await this.equipmentModel.findById(id).exec();
    if (!equipment || !equipment.invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    // Convertir el Buffer de la factura a Base64
    return (equipment.invoice as Buffer).toString('base64');
  }

  // Actualizar un equipo
  async update(
    id: string,
    rawData: Partial<Equipment>,
    photoInitial?: Express.Multer.File[],
    photoFinal?: Express.Multer.File[],
    invoice?: Express.Multer.File,
  ): Promise<Equipment> {
    try {
      // 🔹 1. Normalizar el body (puede venir con prototype nulo)
      const data = Object.assign({}, rawData);

      // 🔹 2. Validar existencia del equipo
      const existingEquipment = await this.findOne(id);
      if (!existingEquipment) {
        throw new HttpException('Equipo no encontrado', HttpStatus.NOT_FOUND);
      }

      // 🔹 3. Validar campos obligatorios
      const requiredFields = ['username', 'assignedTechnician'];
      const missing = requiredFields.filter((f) => !data[f]);
      if (missing.length > 0) {
        throw new HttpException(
          `Faltan los campos obligatorios: ${missing.join(', ')}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // 🔹 4. Armar el objeto de actualización
      const updateData: Partial<Equipment> = { ...data };

      // Convertir fechas si existen
      if (data.authorizationDate) {
        updateData.authorizationDate = new Date(data.authorizationDate);
      }
      if (data.deliveryDate) {
        updateData.deliveryDate = new Date(data.deliveryDate);
      }

      // Reemplazar fotos si llegan nuevas
      if (photoInitial?.length) {
        updateData.photoInitial = photoInitial.map(f => f.buffer);
      }

      if (photoFinal?.length) {
        updateData.photoFinal = photoFinal.map(f => f.buffer);
      }



      // Reemplazar factura si llega nueva
      if (invoice) {
        updateData.invoice = invoice.buffer;
      }

      // Asignar técnico si viene en los datos
      if (data.assignedTechnician) {
        updateData.assignedTechnician = new mongoose.Types.ObjectId(data.assignedTechnician);

        const technician = await this.userModel.findById(data.assignedTechnician);
        if (technician?.phone) {
          await this.twilioClient.messages.create({
            body: `Hola ${technician.name}, se te asignó un nuevo equipo para revisión.`,
            from: this.configService.get<string>('TWILIO_WHATSAPP_NUMBER'),
            to: `whatsapp:+573245765262`,
          });
        }
      }

      // Guardar también el username
      if (data.username) {
        updateData.username = data.username;
      }

      // 🔹 5. Ejecutar actualización
      const updatedEquipment = await this.equipmentModel
        .findByIdAndUpdate(id, updateData, { new: true, runValidators: false })
        .populate('assignedTechnician', 'name username phone')
        .exec();

      return updatedEquipment;
    } catch (error) {
      // 🔹 6. Manejo de errores más informativo
      console.error('❌ Error al actualizar equipo:', error);

      if (error instanceof HttpException) throw error;

      if (error.message?.includes('username')) {
        throw new HttpException(
          `Falta el campo obligatorio 'username' al actualizar el equipo.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        `Error interno al actualizar el equipo: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async updateCustomerApproval(id: string, approval: string): Promise<Equipment> {
    const updateData: any = {
      customerApproval: approval,
    };

    if (approval === 'Aprobado') {
      updateData.authorizationDate = new Date(); // Establece la fecha actual solo si fue aprobado
    }

    return this.equipmentModel.findByIdAndUpdate(id, updateData, { new: true });
  }



  // Eliminar un equipo
  async delete(id: string): Promise<void> {
    const result = await this.equipmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Equipo no encontrado');
    }
  }

  async removePhoto(
    id: string,
    type: 'initial' | 'final',
    photoBase64: string,
  ): Promise<Equipment> {
    const equipment = await this.equipmentModel.findById(id);

    if (!equipment) throw new NotFoundException('Equipment not found');

    const field = type === 'initial' ? 'photoInitial' : 'photoFinal';

    const updated = equipment[field].filter(
      photo => photo.toString('base64') !== photoBase64,
    );

    equipment[field] = updated;

    return equipment.save();
  }



  async generatePDF(equipment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));
      // **Definir columnas**
      const pageWidth = doc.page.width - 100; // Ancho total (descontando márgenes)
      const leftColWidth = pageWidth * 0.3; // 30% para la imagen
      const rightColWidth = pageWidth * 0.7; // 70% para el texto
      const marginX = 35; // Margen izquierdo

      // **1. Agregar imagen en la columna izquierda (30%)**
      try {
        const imagePath = join(__dirname, '..', 'assets', 'logo1.png');
        doc.image(imagePath, marginX, 50, { width: leftColWidth - 10 });

        // **Calcular posición para el texto debajo de la imagen**
        const imageHeight = leftColWidth - 10; // La altura de la imagen (igual al ancho en este caso)
        const textY = 50 + imageHeight + 10; // 50 (posición Y inicial) + altura imagen + espacio extra

        doc.font("Helvetica-Bold")
          .fontSize(12)
          .text('IMPORTACIONES MEDIBÁSCULAS ZOMAC S.A.S', marginX - 30, textY, {
            width: leftColWidth + 30,
            align: 'center',
          });

        doc.font("Helvetica").fontSize(10).text('NIT: 901.561.138-2', marginX, textY + 30, {
          width: leftColWidth - 10,
          align: 'center',
        });

        doc.fontSize(10).text('RESPONSABLE DE IVA', marginX, textY + 45, {
          width: leftColWidth - 10,
          align: 'center',
        });
        doc.fontSize(10).text('APROBACION DEL CLIENTE:', marginX, textY + 80, {
          width: leftColWidth - 10,
          align: 'center',
        });
        const cellWidth = 40; // Ancho de cada celda
        const cellHeight = 20; // Alto de cada celda
        const cellY = textY + 100; // Posición Y de las celdas

        const offsetX = 20; // Ajuste en el eje X

        // Obtener el valor de aprobación del cliente desde la base de datos
        const customerApproval = equipment.customerApproval; // "SI" o "NO"

        // **Dibujar la celda "SI"**
        doc.rect(marginX + 10 + offsetX, cellY, cellWidth, cellHeight).stroke();
        doc.fontSize(10).text('SI', marginX + 10 + offsetX, cellY + 5, {
          width: cellWidth,
          align: 'center',
        });

        // Si el valor es "SI", tachar la celda
        if (customerApproval === "Sí") {
          doc
            .moveTo(marginX + 10 + offsetX, cellY) // Esquina superior izquierda
            .lineTo(marginX + 10 + offsetX + cellWidth, cellY + cellHeight) // Esquina inferior derecha
            .stroke();

          doc
            .moveTo(marginX + 10 + offsetX + cellWidth, cellY) // Esquina superior derecha
            .lineTo(marginX + 10 + offsetX, cellY + cellHeight) // Esquina inferior izquierda
            .stroke();
        }

        // **Dibujar la celda "NO"**
        doc.rect(marginX + cellWidth + 10 + offsetX, cellY, cellWidth, cellHeight).stroke();
        doc.fontSize(10).text('NO', marginX + cellWidth + 10 + offsetX, cellY + 5, {
          width: cellWidth,
          align: 'center',
        });

        // Si el valor es "NO", tachar la celda
        if (customerApproval === "No") {
          doc
            .moveTo(marginX + cellWidth + 10 + offsetX, cellY) // Esquina superior izquierda
            .lineTo(marginX + cellWidth + 10 + offsetX + cellWidth, cellY + cellHeight) // Esquina inferior derecha
            .stroke();

          doc
            .moveTo(marginX + cellWidth + 10 + offsetX + cellWidth, cellY) // Esquina superior derecha
            .lineTo(marginX + cellWidth + 10 + offsetX, cellY + cellHeight) // Esquina inferior izquierda
            .stroke();
        }


        doc.fontSize(10).text('FECHA AUTORIZACIÓN: ', marginX + 12, cellY + 35, {
          width: cellWidth + 80,
          align: 'center',
        });

        const tableX = marginX + 18; // Posición X de la tabla
        const tableY = cellY + 50; // Posición Y de la tabla
        const cellWidthDate = 100; // Ancho de la celda
        const cellHeightDate = 30; // Alto de la celda

        // Dibujar la celda con un rectángulo
        doc.rect(tableX, tableY, cellWidthDate, cellHeightDate).stroke();

        // Medir el tamaño del texto
        const fontSize = 10;
        doc.fontSize(fontSize);
        const text = equipment.authorizationDate ? new Date(equipment.authorizationDate).toLocaleDateString('es-ES') : 'No disponible';
        const textWidth = doc.widthOfString(text);
        const textHeight = doc.currentLineHeight();

        // Calcular coordenadas exactas para centrar el texto en la celda
        const textX = tableX + (cellWidthDate - textWidth) / 2;
        const textYDate = tableY + (cellHeightDate - textHeight) / 2;

        // Agregar el texto centrado en la celda
        doc.text(text, textX, textYDate, {
          width: textWidth,
          align: 'center'
        });


        doc
          .fontSize(10)
          .text('FECHA ENTREGA AL CLIENTE: ', marginX + 12, cellY + 105, {
            width: cellWidth + 80,
            align: 'center',
          });


        const tableXClient = marginX + 18; // Posición X de la tabla
        const tableYClient = cellY + 135; // Posición Y de la tabla
        const cellWidthDateClient = 100; // Ancho de la celda
        const cellHeightDateClient = 30; // Alto de la celda

        // Dibujar la celda con un rectángulo
        doc.rect(tableXClient, tableYClient, cellWidthDateClient, cellHeightDateClient).stroke();

        // Medir el tamaño del texto
        const fontSizeClient = 10;
        doc.fontSize(fontSizeClient);
        const textClient = equipment.deliveryDate ? new Date(equipment.deliveryDate).toLocaleDateString('es-ES') : 'No disponible';
        const textWidthClient = doc.widthOfString(textClient);
        const textHeightClient = doc.currentLineHeight();

        // Calcular coordenadas exactas para centrar el texto en la celda
        const textXClient = tableXClient + (cellWidthDateClient - textWidthClient) / 2;
        const textYDateClient = tableYClient + (cellHeightDateClient - textHeightClient) / 2;

        // Agregar el texto centrado en la celda
        doc.text(textClient, textXClient, textYDateClient, {
          width: textWidthClient,
          align: 'center'
        });
        doc
          .fontSize(8)
          .text('Tel: +57 304 130 1189', marginX, textY + 390, {
            width: leftColWidth - 10,
            align: 'left',
          });

        doc.fontSize(8).text('info@medibasculas.com', marginX, textY + 401, {
          width: leftColWidth - 10,
          align: 'left',
        });

        doc.fontSize(8).text('Cra 45D #60-72, Medellin Colombia', marginX, textY + 412, {
          width: leftColWidth - 10,
          align: 'left',
        });
        doc.fontSize(8).text('+57 304 130 1189', marginX, textY + 449, {
          width: leftColWidth - 10,
          align: 'left',
        });
        doc.fontSize(8).text('serviciotecnico@medibasculas.com', marginX, textY + 460, {
          width: leftColWidth - 10,
          align: 'left',
        });
        doc.fontSize(8).text('http://www.medibasculas.com/', marginX, textY + 471, {
          width: leftColWidth - 10,
          align: 'left',
        });
      } catch (error) {
        console.error('Error al cargar la imagen:', error.message);
      }

      // **2. Dibujar línea vertical divisoria**
      const lineX = marginX + leftColWidth + 5; // Posición X de la línea
      doc
        .moveTo(lineX, 40) // Punto de inicio
        .lineTo(lineX, doc.page.height - 50) // Punto de fin
        .lineWidth(1) // Grosor de la línea
        .strokeColor('#000') // Color negro
        .stroke(); // Dibujar la línea

      // **2. Agregar contenido en la columna derecha (70%)**
      const contentX = marginX + leftColWidth + 30; // Inicia después de la imagen
      let contentY = 50;


      // **Texto de la fecha**
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('FECHA DE INGRESO: ', contentX, contentY + 8, { continued: true })
        .font('Helvetica')
        .text(new Date().toLocaleDateString('es-ES'));

      // **Caja de "Recepción Equipo"**
      const boxX = 450; // Posición en X (ajustar según diseño)
      const boxY = contentY - 5; // Posición en Y
      const boxWidth = 120;
      const boxHeight = 40;

      // Dibujar el cuadro
      doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

      // Dibujar línea divisoria interna
      doc.moveTo(boxX, boxY + 20).lineTo(boxX + boxWidth, boxY + 20).stroke();

      // Texto dentro del cuadro
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('RECEPCIÓN EQUIPO', boxX, boxY + 5, { width: boxWidth, align: 'center' });

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('RE-0496', boxX, boxY + 25, { width: boxWidth, align: 'center' });


      contentY += 75;

      // Texto a mostrar
      const textTitle = `HOJA DE CONTRATO DE SERVICIO: `;
      const textXTitle = contentX;
      const textYTitle = contentY;

      // **Dibujar el texto centrado**
      doc.font("Helvetica-Bold").fontSize(12).text(textTitle, textXTitle, textYTitle, {
        width: rightColWidth,
        align: 'center',
      });

      // **Obtener el ancho del texto para la línea**
      const textWidthTitle = doc.widthOfString(textTitle);
      const textHeightTitle = doc.currentLineHeight(); // Altura del texto

      // **Calcular la posición X para centrar la línea**
      const centerX = textXTitle + (rightColWidth - textWidthTitle) / 2;

      // **Dibujar la línea centrada debajo del texto**
      doc
        .moveTo(centerX, textYTitle + textHeightTitle + 2) // Punto de inicio (centrado)
        .lineTo(centerX + textWidthTitle, textYTitle + textHeightTitle + 2) // Punto final
        .lineWidth(1) // Grosor de la línea
        .strokeColor('#000') // Color negro
        .stroke(); // Dibujar la línea



      contentY += 40;

      // **3. Datos del Cliente**
      doc.fontSize(14).text('DATOS DEL CLIENTE', contentX, contentY, {
        width: rightColWidth,
        underline: true,
      });
      contentY += 20;

      doc
        .font('Helvetica-Bold') // Poner en negrita
        .text('NOMBRE: ', contentX, contentY, { continued: true }) // `continued: true` mantiene la misma línea
        .font('Helvetica') // Volver a texto normal
        .text(equipment.company || 'No disponible');

      contentY += 15;
      doc
        .font('Helvetica-Bold')
        .text('C.C / NIT: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.doc || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('EMAIL: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.email || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('DIRECCIÓN: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.address || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('TEL/CEL: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.phone || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('CONTACTO: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.firstname + " " + equipment.lastname || 'No disponible');

      contentY += 30;

      // **4. Datos del Equipo**
      doc.font("Helvetica-Bold").fontSize(14).text('DATOS DEL EQUIPO', contentX, contentY, {
        width: rightColWidth,
        underline: true,
      });
      contentY += 20;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('EQUIPO: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.name || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('MARCA: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.brand || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('MODELO: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.model || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('SERIAL: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.serial || 'N/A');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('ACCESORIOS: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.accessories || 'No disponible');
      contentY += 15;

      doc
        .font('Helvetica-Bold')
        .text('DEFECTOS: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.issue || 'No especificado');
      contentY += 30;

      // **5. Ficha Técnica**
      doc.font("Helvetica-Bold").fontSize(14).text('FICHA TÉCNICA', contentX, contentY, {
        width: rightColWidth,
        underline: true,
      });
      contentY += 20;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('FALLA REPORTADA POR EL CLIENTE: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.issue || 'No especificado');
      contentY += 30;

      // **6. Diagnóstico Técnico**
      doc.font("Helvetica-Bold").fontSize(14).text('DIAGNÓSTICO TÉCNICO', contentX, contentY, {
        width: rightColWidth,
        underline: true,
      });
      contentY += 20;

      const imageWidth = 100;
      const imageHeight = 50;
      const margin = 50;
      const imageSize = 142; // 5 cm en puntos

      // =============================
      // FOTOS INICIALES
      // =============================

      doc.font("Helvetica-Bold").fontSize(12).text("FOTOS INICIALES", contentX, contentY);
      contentY += 20;

      if (equipment.photosInitial && Array.isArray(equipment.photosInitial)) {

        equipment.photosInitial.slice(0, 2).forEach((photoBinary, index) => {
          try {
            let base64String;

            if (typeof photoBinary !== "string") {
              if (photoBinary?.toString) {
                base64String = photoBinary.toString("base64");
              } else {
                return;
              }
            } else {
              base64String = photoBinary;
            }

            if (!base64String.startsWith("data:image")) {
              base64String = `data:image/png;base64,${base64String}`;
            }

            const base64Data = base64String.split(",")[1];
            const imageBuffer = Buffer.from(base64Data, "base64");

            if (imageBuffer.length < 500) {
              return;
            }

            if (contentY + imageSize > doc.page.height - 50) {
              doc.addPage();
              contentY = margin;
            }

            doc.image(
              imageBuffer,
              contentX + (index * (imageSize + 20)),
              contentY,
              { width: imageSize, height: imageSize }
            );

          } catch (error) {
            console.error("Error procesando foto inicial:", error.message);
          }
        });

        contentY += imageSize + 30;

      } else {
        doc.font("Helvetica").fontSize(10).text("No se adjuntaron fotos iniciales.", contentX, contentY);
        contentY += 20;
      }



      // =============================
      // FOTOS FINALES
      // =============================

      doc.font("Helvetica-Bold").fontSize(12).text("FOTOS FINALES", contentX, contentY);
      contentY += 20;

      if (equipment.photosFinal && Array.isArray(equipment.photosFinal)) {

        equipment.photosFinal.slice(0, 2).forEach((photoBinary, index) => {
          try {
            let base64String;

            if (typeof photoBinary !== "string") {
              if (photoBinary?.toString) {
                base64String = photoBinary.toString("base64");
              } else {
                return;
              }
            } else {
              base64String = photoBinary;
            }

            if (!base64String.startsWith("data:image")) {
              base64String = `data:image/png;base64,${base64String}`;
            }

            const base64Data = base64String.split(",")[1];
            const imageBuffer = Buffer.from(base64Data, "base64");

            if (imageBuffer.length < 500) {
              return;
            }

            if (contentY + imageSize > doc.page.height - 50) {
              doc.addPage();
              contentY = margin;
            }

            doc.image(
              imageBuffer,
              contentX + (index * (imageSize + 20)),
              contentY,
              { width: imageSize, height: imageSize }
            );

          } catch (error) {
            console.error("Error procesando foto final:", error.message);
          }
        });

        contentY += imageSize + 30;

      } else {
        doc.font("Helvetica").fontSize(10).text("No se adjuntaron fotos finales.", contentX, contentY);
        contentY += 20;
      }






      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DIAGNÓSTICO: ', contentX, contentY, { continued: true })
        .font('Helvetica')
        .text(equipment.diagnosis || 'Pendiente de revisión.');
      contentY += 30;

      // **8. Términos y Condiciones**
      doc.font("Helvetica-Bold").fontSize(14).text('TÉRMINOS Y CONDICIONES DE SERVICIO', contentX, contentY, {
        width: rightColWidth,
        underline: true,
      });
      contentY += 20;


      doc.font("Helvetica")
        .fontSize(10)
        .text(
          'PARA LOS EFECTOS DE CONVENIO ENTIÉNDASE LA EMPRESA IMPORTACIONES MEDIBÁSCULAS ZOMAC S.A.S como prestador del servicio; y como cliente a quien firma la presente. EL CLIENTE acepta y convenio expresamente lo siguiente: ',
          contentX,
          contentY,
          { width: rightColWidth }
        );

      // Función para imprimir cada versículo con el número en negrita
      const printVerse = (number, text, bold = false) => {
        doc.font("Helvetica-Bold").text(`${number}. `, { continued: true });

        if (bold) {
          doc.font("Helvetica-Bold").text(text);
        } else {
          doc.font("Helvetica").text(text);
        }
      };

      // Lista de versículos con su estado de negrita
      const verses = [
        { text: 'No nos hacemos responsables por fallas ocultas no declaradas por el cliente, presentes en el equipo que solo son identificadas en una revisión técnica exhaustiva.', bold: false },
        { text: 'La empresa no se hace responsable por equipos dejados en el taller, pasado los 30 días, perdiendo el cliente todo el derecho sobre el/los equipos en cuestión, y el equipo pasará a ser reciclado y desechado.', bold: false },
        { text: 'La garantía cubre solo la pieza reparada y/o reemplazada del equipo y será válida por 01 un mes desde la fecha de entrega siempre que este no tenga el sello de garantía alterado y con la presente hoja de servicio.', bold: true }, // 🔹 Todo el punto 3 en negrita
        { text: 'Al cumplir 10 días hábiles de notificarle que su equipo está listo para ser retirado, se comenzará a cobrar 3% por día del precio del servicio prestado, por concepto de almacenaje hasta lo expresado en la cláusula 2.', bold: false },
        { text: 'La empresa no se hace responsable si durante el tiempo establecido en la cláusula 4 el equipo sufre daños o pérdidas en nuestras instalaciones por algún desastre de índole natural, inundaciones, terremotos, sismos, lluvia, incendios, hurtos, robos, causando estos el daño parcial o total en el equipo o la desaparición.', bold: false },
        { text: 'Las fallas reportadas por el cliente al momento de solicitar el servicio no son únicas ni absolutas y serán verificadas al momento de la revisión y las fallas encontradas serán notificadas al cliente para validar la reparación.', bold: false },
        { text: 'En caso de que una prueba de funcionamiento demuestre que el desperfecto no radica en el equipo, la empresa cobrará el valor vigente de la revisión.', bold: false },
        { text: 'La empresa dará un presupuesto con el valor del servicio, sin que ello constituya compromiso alguno, y se le notificará al cliente, quien dentro de los (03) tres días hábiles siguientes debe autorizar o no el servicio y quedará escrito en esta hoja con la respectiva fecha.', bold: false },
        { text: 'La empresa cobrará el valor de revisión si el cliente no aprueba el servicio de reparación.', bold: false },
        { text: 'La empresa no recibirá el equipo por garantía cuando el lapso de esta haya culminado y sin presentar esta hoja donde está expuesto el repuesto y/o falla reparada.', bold: false },
        { text: 'La garantía no cubre cuando el equipo es reparado, revisado o manipulado por un tercero y/o haya sido adaptado o conectado algún equipo o accesorio ajeno a su modelo de fabricación.', bold: false }
      ];

      // Imprimir cada versículo con su número en negrita
      verses.forEach((verse, index) => {
        printVerse(index + 1, verse.text, verse.bold);
      });




      contentY -= 120;

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .text(
          'He leído y acepto los términos y condiciones:', contentX,
          contentY,
          { width: rightColWidth },
        );

      contentY += 60;

      // **9. Firma del Cliente**
      doc.font("Helvetica")
        .fontSize(12)
        .text(
          'Firma del cliente: ____________________________',
          contentX,
          contentY,
        );

      contentY += 20;
      doc.font("Helvetica")
        .fontSize(12)
        .text(
          'Atentamente: ',
          contentX,
          contentY,
        );
      contentY += 20;
      doc.font("Helvetica")
        .fontSize(12)
        .text(
          'IMPORTACIONES MEDIBÁSCULAS ZOMAC S.A.S',
          contentX,
          contentY,
        );
      contentY += 20;
      doc.font("Helvetica")
        .fontSize(12)
        .text(
          'NIT: 901.561.138-2',
          contentX,
          contentY,
        );

      // **Finalizar PDF**
      doc.end();
    });
  }
}
