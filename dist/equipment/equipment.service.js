"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const equipment_schema_1 = require("./equipment.schema");
const PDFDocument = require("pdfkit");
const path_1 = require("path");
const twilio_1 = require("twilio");
const config_1 = require("@nestjs/config");
let EquipmentService = class EquipmentService {
    constructor(equipmentModel, userModel, configService) {
        this.equipmentModel = equipmentModel;
        this.userModel = userModel;
        this.configService = configService;
        this.twilioClient = new twilio_1.Twilio(this.configService.get('TWILIO_ACCOUNT_SID'), this.configService.get('TWILIO_AUTH_TOKEN'));
    }
    async create(data, photos, invoice) {
        const photoBuffers = photos?.map((file) => file.buffer) || [];
        const invoiceBuffer = invoice?.buffer || null;
        const newEquipment = new this.equipmentModel({
            ...data,
            photos: photoBuffers,
            invoice: invoiceBuffer,
        });
        return newEquipment.save();
    }
    async findAll() {
        const equipments = await this.equipmentModel
            .find()
            .populate('assignedTechnician', 'name username phone')
            .exec();
        return equipments.map((equipment) => ({
            ...equipment.toObject(),
            invoice: equipment.invoice
                ? equipment.invoice.toString('base64')
                : null,
        }));
    }
    async findByTechnician(technicianId) {
        const equipments = await this.equipmentModel
            .find({ assignedTechnician: new mongoose_2.default.Types.ObjectId(technicianId) })
            .populate('assignedTechnician', 'name username phone')
            .exec();
        return equipments.map((equipment) => ({
            ...equipment.toObject(),
            invoice: equipment.invoice
                ? equipment.invoice.toString('base64')
                : null,
        }));
    }
    async findByEmail(email) {
        const equipments = await this.equipmentModel
            .find({ email })
            .exec();
        return equipments.map((equipment) => ({
            ...equipment.toObject(),
            invoice: equipment.invoice
                ? equipment.invoice.toString('base64')
                : null,
        }));
    }
    async findOne(id) {
        const equipment = await this.equipmentModel
            .findById(id)
            .populate('assignedTechnician', 'name username phone')
            .exec();
        if (!equipment) {
            throw new common_1.NotFoundException('Equipo no encontrado');
        }
        return {
            ...equipment.toObject(),
            invoice: equipment.invoice
                ? equipment.invoice.toString('base64')
                : null,
        };
    }
    async getPhotos(id) {
        const equipment = await this.equipmentModel.findById(id).exec();
        if (!equipment || !equipment.photos) {
            throw new common_1.NotFoundException('Fotos no encontradas');
        }
        return equipment.photos;
    }
    async getInvoice(id) {
        const equipment = await this.equipmentModel.findById(id).exec();
        if (!equipment || !equipment.invoice) {
            throw new common_1.NotFoundException('Factura no encontrada');
        }
        return equipment.invoice.toString('base64');
    }
    async update(id, rawData, photos, invoice) {
        try {
            const data = Object.assign({}, rawData);
            const existingEquipment = await this.findOne(id);
            if (!existingEquipment) {
                throw new common_1.HttpException('Equipo no encontrado', common_1.HttpStatus.NOT_FOUND);
            }
            const requiredFields = ['username', 'assignedTechnician'];
            const missing = requiredFields.filter((f) => !data[f]);
            if (missing.length > 0) {
                throw new common_1.HttpException(`Faltan los campos obligatorios: ${missing.join(', ')}.`, common_1.HttpStatus.BAD_REQUEST);
            }
            const updateData = { ...data };
            if (data.authorizationDate) {
                updateData.authorizationDate = new Date(data.authorizationDate);
            }
            if (data.deliveryDate) {
                updateData.deliveryDate = new Date(data.deliveryDate);
            }
            if (photos?.length) {
                updateData.photos = photos.map((file) => file.buffer);
            }
            if (invoice) {
                updateData.invoice = invoice.buffer;
            }
            if (data.assignedTechnician) {
                updateData.assignedTechnician = new mongoose_2.default.Types.ObjectId(data.assignedTechnician);
                const technician = await this.userModel.findById(data.assignedTechnician);
                if (technician?.phone) {
                    await this.twilioClient.messages.create({
                        body: `Hola ${technician.name}, se te asignó un nuevo equipo para revisión.`,
                        from: this.configService.get('TWILIO_WHATSAPP_NUMBER'),
                        to: `whatsapp:+573245765262`,
                    });
                }
            }
            if (data.username) {
                updateData.username = data.username;
            }
            const updatedEquipment = await this.equipmentModel
                .findByIdAndUpdate(id, updateData, { new: true, runValidators: false })
                .populate('assignedTechnician', 'name username phone')
                .exec();
            return updatedEquipment;
        }
        catch (error) {
            console.error('❌ Error al actualizar equipo:', error);
            if (error instanceof common_1.HttpException)
                throw error;
            if (error.message?.includes('username')) {
                throw new common_1.HttpException(`Falta el campo obligatorio 'username' al actualizar el equipo.`, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException(`Error interno al actualizar el equipo: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateCustomerApproval(id, approval) {
        const updateData = {
            customerApproval: approval,
        };
        if (approval === 'Aprobado') {
            updateData.authorizationDate = new Date();
        }
        return this.equipmentModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    async delete(id) {
        const result = await this.equipmentModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Equipo no encontrado');
        }
    }
    async removePhoto(id, photoUrl) {
        const equipment = await this.findOne(id);
        if (!equipment.photos || !Array.isArray(equipment.photos)) {
            throw new common_1.NotFoundException('El equipo no tiene fotos registradas.');
        }
        const updatedPhotos = equipment.photos.filter(photo => photo.toString('base64') !== photoUrl);
        if (updatedPhotos.length === equipment.photos.length) {
            throw new common_1.NotFoundException('Foto no encontrada en el equipo.');
        }
        equipment.photos = updatedPhotos;
        return this.equipmentModel.findByIdAndUpdate(id, equipment, { new: true }).exec();
    }
    async generatePDF(equipment) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));
            const pageWidth = doc.page.width - 100;
            const leftColWidth = pageWidth * 0.3;
            const rightColWidth = pageWidth * 0.7;
            const marginX = 35;
            try {
                const imagePath = (0, path_1.join)(__dirname, '..', 'assets', 'logo1.png');
                doc.image(imagePath, marginX, 50, { width: leftColWidth - 10 });
                const imageHeight = leftColWidth - 10;
                const textY = 50 + imageHeight + 10;
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
                const cellWidth = 40;
                const cellHeight = 20;
                const cellY = textY + 100;
                const offsetX = 20;
                const customerApproval = equipment.customerApproval;
                doc.rect(marginX + 10 + offsetX, cellY, cellWidth, cellHeight).stroke();
                doc.fontSize(10).text('SI', marginX + 10 + offsetX, cellY + 5, {
                    width: cellWidth,
                    align: 'center',
                });
                if (customerApproval === "Sí") {
                    doc
                        .moveTo(marginX + 10 + offsetX, cellY)
                        .lineTo(marginX + 10 + offsetX + cellWidth, cellY + cellHeight)
                        .stroke();
                    doc
                        .moveTo(marginX + 10 + offsetX + cellWidth, cellY)
                        .lineTo(marginX + 10 + offsetX, cellY + cellHeight)
                        .stroke();
                }
                doc.rect(marginX + cellWidth + 10 + offsetX, cellY, cellWidth, cellHeight).stroke();
                doc.fontSize(10).text('NO', marginX + cellWidth + 10 + offsetX, cellY + 5, {
                    width: cellWidth,
                    align: 'center',
                });
                if (customerApproval === "No") {
                    doc
                        .moveTo(marginX + cellWidth + 10 + offsetX, cellY)
                        .lineTo(marginX + cellWidth + 10 + offsetX + cellWidth, cellY + cellHeight)
                        .stroke();
                    doc
                        .moveTo(marginX + cellWidth + 10 + offsetX + cellWidth, cellY)
                        .lineTo(marginX + cellWidth + 10 + offsetX, cellY + cellHeight)
                        .stroke();
                }
                doc.fontSize(10).text('FECHA AUTORIZACIÓN: ', marginX + 12, cellY + 35, {
                    width: cellWidth + 80,
                    align: 'center',
                });
                const tableX = marginX + 18;
                const tableY = cellY + 50;
                const cellWidthDate = 100;
                const cellHeightDate = 30;
                doc.rect(tableX, tableY, cellWidthDate, cellHeightDate).stroke();
                const fontSize = 10;
                doc.fontSize(fontSize);
                const text = equipment.authorizationDate ? new Date(equipment.authorizationDate).toLocaleDateString('es-ES') : 'No disponible';
                const textWidth = doc.widthOfString(text);
                const textHeight = doc.currentLineHeight();
                const textX = tableX + (cellWidthDate - textWidth) / 2;
                const textYDate = tableY + (cellHeightDate - textHeight) / 2;
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
                const tableXClient = marginX + 18;
                const tableYClient = cellY + 135;
                const cellWidthDateClient = 100;
                const cellHeightDateClient = 30;
                doc.rect(tableXClient, tableYClient, cellWidthDateClient, cellHeightDateClient).stroke();
                const fontSizeClient = 10;
                doc.fontSize(fontSizeClient);
                const textClient = equipment.deliveryDate ? new Date(equipment.deliveryDate).toLocaleDateString('es-ES') : 'No disponible';
                const textWidthClient = doc.widthOfString(textClient);
                const textHeightClient = doc.currentLineHeight();
                const textXClient = tableXClient + (cellWidthDateClient - textWidthClient) / 2;
                const textYDateClient = tableYClient + (cellHeightDateClient - textHeightClient) / 2;
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
            }
            catch (error) {
                console.error('Error al cargar la imagen:', error.message);
            }
            const lineX = marginX + leftColWidth + 5;
            doc
                .moveTo(lineX, 40)
                .lineTo(lineX, doc.page.height - 50)
                .lineWidth(1)
                .strokeColor('#000')
                .stroke();
            const contentX = marginX + leftColWidth + 30;
            let contentY = 50;
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('FECHA DE INGRESO: ', contentX, contentY + 8, { continued: true })
                .font('Helvetica')
                .text(new Date().toLocaleDateString('es-ES'));
            const boxX = 450;
            const boxY = contentY - 5;
            const boxWidth = 120;
            const boxHeight = 40;
            doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
            doc.moveTo(boxX, boxY + 20).lineTo(boxX + boxWidth, boxY + 20).stroke();
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('RECEPCIÓN EQUIPO', boxX, boxY + 5, { width: boxWidth, align: 'center' });
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('RE-0496', boxX, boxY + 25, { width: boxWidth, align: 'center' });
            contentY += 75;
            const textTitle = `HOJA DE CONTRATO DE SERVICIO: `;
            const textXTitle = contentX;
            const textYTitle = contentY;
            doc.font("Helvetica-Bold").fontSize(12).text(textTitle, textXTitle, textYTitle, {
                width: rightColWidth,
                align: 'center',
            });
            const textWidthTitle = doc.widthOfString(textTitle);
            const textHeightTitle = doc.currentLineHeight();
            const centerX = textXTitle + (rightColWidth - textWidthTitle) / 2;
            doc
                .moveTo(centerX, textYTitle + textHeightTitle + 2)
                .lineTo(centerX + textWidthTitle, textYTitle + textHeightTitle + 2)
                .lineWidth(1)
                .strokeColor('#000')
                .stroke();
            contentY += 40;
            doc.fontSize(14).text('DATOS DEL CLIENTE', contentX, contentY, {
                width: rightColWidth,
                underline: true,
            });
            contentY += 20;
            doc
                .font('Helvetica-Bold')
                .text('NOMBRE: ', contentX, contentY, { continued: true })
                .font('Helvetica')
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
            doc.font("Helvetica-Bold").fontSize(14).text('DIAGNÓSTICO TÉCNICO', contentX, contentY, {
                width: rightColWidth,
                underline: true,
            });
            contentY += 20;
            const imageWidth = 100;
            const imageHeight = 50;
            const margin = 50;
            if (equipment.photos && Array.isArray(equipment.photos)) {
                equipment.photos.forEach((photoBinary, index) => {
                    try {
                        let base64String;
                        if (typeof photoBinary !== "string") {
                            console.warn(`⚠️ La imagen en posición ${index} no es un string, intentando extraer Base64...`);
                            if (photoBinary.toString) {
                                base64String = photoBinary.toString("base64");
                            }
                            else {
                                console.error(`🚨 No se pudo convertir la imagen en posición ${index} a Base64.`);
                                return;
                            }
                        }
                        else {
                            base64String = photoBinary;
                        }
                        if (!base64String.startsWith("data:image")) {
                            console.warn(`⚠️ No tiene prefijo Base64 en posición ${index}, agregando "data:image/png;base64,"...`);
                            base64String = `data:image/png;base64,${base64String}`;
                        }
                        const base64Data = base64String.split(",")[1];
                        const imageBuffer = Buffer.from(base64Data, "base64");
                        if (imageBuffer.length < 500) {
                            console.error(`🚨 El buffer generado para la imagen en posición ${index} es demasiado pequeño (${imageBuffer.length} bytes).`);
                            return;
                        }
                        if (contentY + imageHeight + margin > doc.page.height) {
                            doc.addPage();
                            contentY = margin;
                        }
                        doc.image(imageBuffer, contentX, contentY, { width: imageWidth, height: imageHeight });
                        contentY += imageHeight + 10;
                        console.log(`✅ Imagen en posición ${index} agregada correctamente.`);
                    }
                    catch (error) {
                        console.error(`❌ Error al procesar imagen en posición ${index}:`, error.message);
                    }
                });
            }
            else {
                console.error("❌ equipment.photos no es un array o está vacío:", equipment.photos);
            }
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('DIAGNÓSTICO: ', contentX, contentY, { continued: true })
                .font('Helvetica')
                .text(equipment.diagnosis || 'Pendiente de revisión.');
            contentY += 30;
            doc.font("Helvetica-Bold").fontSize(14).text('TÉRMINOS Y CONDICIONES DE SERVICIO', contentX, contentY, {
                width: rightColWidth,
                underline: true,
            });
            contentY += 20;
            doc.font("Helvetica")
                .fontSize(10)
                .text('PARA LOS EFECTOS DE CONVENIO ENTIÉNDASE LA EMPRESA IMPORTACIONES MEDIBÁSCULAS ZOMAC S.A.S como prestador del servicio; y como cliente a quien firma la presente. EL CLIENTE acepta y convenio expresamente lo siguiente: ', contentX, contentY, { width: rightColWidth });
            const printVerse = (number, text, bold = false) => {
                doc.font("Helvetica-Bold").text(`${number}. `, { continued: true });
                if (bold) {
                    doc.font("Helvetica-Bold").text(text);
                }
                else {
                    doc.font("Helvetica").text(text);
                }
            };
            const verses = [
                { text: 'No nos hacemos responsables por fallas ocultas no declaradas por el cliente, presentes en el equipo que solo son identificadas en una revisión técnica exhaustiva.', bold: false },
                { text: 'La empresa no se hace responsable por equipos dejados en el taller, pasado los 30 días, perdiendo el cliente todo el derecho sobre el/los equipos en cuestión, y el equipo pasará a ser reciclado y desechado.', bold: false },
                { text: 'La garantía cubre solo la pieza reparada y/o reemplazada del equipo y será válida por 01 un mes desde la fecha de entrega siempre que este no tenga el sello de garantía alterado y con la presente hoja de servicio.', bold: true },
                { text: 'Al cumplir 10 días hábiles de notificarle que su equipo está listo para ser retirado, se comenzará a cobrar 3% por día del precio del servicio prestado, por concepto de almacenaje hasta lo expresado en la cláusula 2.', bold: false },
                { text: 'La empresa no se hace responsable si durante el tiempo establecido en la cláusula 4 el equipo sufre daños o pérdidas en nuestras instalaciones por algún desastre de índole natural, inundaciones, terremotos, sismos, lluvia, incendios, hurtos, robos, causando estos el daño parcial o total en el equipo o la desaparición.', bold: false },
                { text: 'Las fallas reportadas por el cliente al momento de solicitar el servicio no son únicas ni absolutas y serán verificadas al momento de la revisión y las fallas encontradas serán notificadas al cliente para validar la reparación.', bold: false },
                { text: 'En caso de que una prueba de funcionamiento demuestre que el desperfecto no radica en el equipo, la empresa cobrará el valor vigente de la revisión.', bold: false },
                { text: 'La empresa dará un presupuesto con el valor del servicio, sin que ello constituya compromiso alguno, y se le notificará al cliente, quien dentro de los (03) tres días hábiles siguientes debe autorizar o no el servicio y quedará escrito en esta hoja con la respectiva fecha.', bold: false },
                { text: 'La empresa cobrará el valor de revisión si el cliente no aprueba el servicio de reparación.', bold: false },
                { text: 'La empresa no recibirá el equipo por garantía cuando el lapso de esta haya culminado y sin presentar esta hoja donde está expuesto el repuesto y/o falla reparada.', bold: false },
                { text: 'La garantía no cubre cuando el equipo es reparado, revisado o manipulado por un tercero y/o haya sido adaptado o conectado algún equipo o accesorio ajeno a su modelo de fabricación.', bold: false }
            ];
            verses.forEach((verse, index) => {
                printVerse(index + 1, verse.text, verse.bold);
            });
            contentY -= 120;
            doc.font("Helvetica-Bold")
                .fontSize(10)
                .text('He leído y acepto los términos y condiciones:', contentX, contentY, { width: rightColWidth });
            contentY += 60;
            doc.font("Helvetica")
                .fontSize(12)
                .text('Firma del cliente: ____________________________', contentX, contentY);
            contentY += 20;
            doc.font("Helvetica")
                .fontSize(12)
                .text('Atentamente: ', contentX, contentY);
            contentY += 20;
            doc.font("Helvetica")
                .fontSize(12)
                .text('IMPORTACIONES MEDIBÁSCULAS ZOMAC S.A.S', contentX, contentY);
            contentY += 20;
            doc.font("Helvetica")
                .fontSize(12)
                .text('NIT: 901.561.138-2', contentX, contentY);
            doc.end();
        });
    }
};
exports.EquipmentService = EquipmentService;
exports.EquipmentService = EquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(equipment_schema_1.Equipment.name)),
    __param(1, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService])
], EquipmentService);
//# sourceMappingURL=equipment.service.js.map