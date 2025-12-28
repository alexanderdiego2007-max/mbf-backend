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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_schema_1 = require("./inventory.schema");
const PDFDocument = require("pdfkit");
const path_1 = require("path");
const formatDate_1 = require("../utils/formatDate");
let InventoryService = class InventoryService {
    constructor(inventoryModel) {
        this.inventoryModel = inventoryModel;
    }
    async create(data) {
        try {
            let FT = data.FT;
            if (!FT) {
                const maxFTDoc = await this.inventoryModel
                    .find({ FT: { $regex: /^FT-\d+$/ } })
                    .sort({ FT: -1 })
                    .limit(1)
                    .exec();
                const maxFT = maxFTDoc.length > 0 ? maxFTDoc[0].FT : null;
                const maxFTNum = maxFT ? parseInt(maxFT.replace('FT-', ''), 10) : null;
                FT = maxFTNum !== null && maxFTNum >= 300
                    ? `FT-${maxFTNum + 1}`
                    : 'FT-300';
            }
            else {
                if (typeof FT === 'string' && !FT.startsWith('FT-')) {
                    FT = `FT-${FT}`;
                }
                const exists = await this.inventoryModel.exists({ FT });
                if (exists) {
                    throw new common_1.BadRequestException(`La ficha técnica ${FT} ya existe.`);
                }
            }
            const newInventory = new this.inventoryModel({
                ...data,
                FT,
            });
            return await newInventory.save();
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                const validationErrors = Object.keys(error.errors).map((key) => ({
                    field: key,
                    message: error.errors[key].message,
                }));
                throw new common_1.BadRequestException({
                    message: 'Validation failed',
                    errors: validationErrors,
                });
            }
            throw new common_1.InternalServerErrorException('Failed to create inventory. Please try again.');
        }
    }
    async generatePDF(inventory) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));
            doc.rect(50, 30, 520, 75).stroke();
            const cellX = 50;
            const cellY = 30;
            const headerCellWidth = 130;
            doc
                .fillColor('#f0f0f0')
                .rect(cellX, cellY, headerCellWidth, 75)
                .fill();
            doc
                .strokeColor('black')
                .lineWidth(1)
                .rect(cellX, cellY, headerCellWidth, 75)
                .stroke();
            doc.fillColor('black');
            const logoWidth = 60;
            const logoHeight = 60;
            const logoX = cellX + (headerCellWidth - logoWidth) / 2;
            const logoY = cellY + (75 - logoHeight) / 2;
            try {
                const imagePath = (0, path_1.join)(__dirname, '..', 'assets', 'logo.png');
                doc.image(imagePath, logoX, logoY, {
                    width: logoWidth,
                    height: logoHeight,
                });
            }
            catch (error) {
                console.error('Error al cargar la imagen:', error.message);
            }
            doc
                .font('Helvetica-Bold')
                .fontSize(8)
                .text('IMPORTACIONES MEDIBÁSCULAS ZOMAC S.A.S.', 43, 40, {
                align: 'center',
                width: 500,
            });
            doc.font('Helvetica').fontSize(8).text('Whatsapp 304 1301189', 40, 55, {
                align: 'center',
                width: 500,
            });
            doc.fontSize(8).text('serviciotecnico@medibasculas.com', 40, 70, {
                align: 'center',
                width: 500,
            });
            doc.fontSize(8).text('CRA 45D #60-72, Medellín, Antioquia', 40, 85, {
                align: 'center',
                width: 500,
            });
            const cellHeightRight = 18.5;
            const labelWidth = 100;
            const valueWidth = 65;
            const startXRight = 405;
            let startYRight = 30;
            const drawCell = (label, value, x, y) => {
                doc
                    .save()
                    .fillColor('#f0f0f0')
                    .rect(x, y, labelWidth, cellHeightRight)
                    .fill()
                    .restore();
                doc
                    .save()
                    .fillColor('white')
                    .rect(x + labelWidth, y, valueWidth, cellHeightRight)
                    .fill()
                    .restore();
                doc.rect(x, y, labelWidth, cellHeightRight).stroke();
                doc.rect(x + labelWidth, y, valueWidth, cellHeightRight).stroke();
                doc
                    .font('Helvetica-Bold')
                    .fillColor('black')
                    .text(label, x + 5, y + 7, {
                    width: labelWidth - 10,
                    align: 'center',
                });
                doc.font('Helvetica').text(value, x + labelWidth + 5, y + 7, {
                    width: valueWidth - 10,
                    align: 'center',
                });
            };
            drawCell('FICHA TÉCNICA:', inventory.FT ?? "No disponible", startXRight, startYRight);
            startYRight += cellHeightRight;
            drawCell('FECHA SERVICIO:', '23/11/2023', startXRight, startYRight);
            startYRight += cellHeightRight;
            drawCell('PRÓXIMO SERVICIO:', '23/05/2024', startXRight, startYRight);
            startYRight += cellHeightRight;
            drawCell('PRIORIDAD:', inventory.maintenancePriority.toUpperCase(), startXRight, startYRight);
            let currentY = 120;
            const cellHeight = 20;
            const columnWidth = 130;
            const startX = 51;
            const offsetX = 130;
            const generalData = [
                ['Nombre del Equipo', inventory.name || 'No disponible'],
                ['Marca', inventory.brand || 'No disponible'],
                ['Modelo', inventory.model || 'No disponible'],
                ['Serie', inventory.serialNumber || 'No disponible'],
                [
                    'Fecha de Compra',
                    (0, formatDate_1.default)(inventory.purchaseDate) || 'No disponible',
                ],
                ['Ubicación', inventory.location || 'No disponible'],
            ];
            generalData.forEach((row, index) => {
                const col = index % 2;
                const rowNumber = Math.floor(index / 2);
                const extraOffset = row[0] === 'Marca' ||
                    row[0] === 'Serie' ||
                    row[0] === 'Ubicación' ||
                    row[0] === 'Responsable' ||
                    row[0] === 'Garantía' ||
                    row[0] === 'Última Revisión'
                    ? offsetX
                    : 0;
                const x = startX + col * columnWidth + extraOffset;
                const y = currentY + rowNumber * cellHeight;
                doc
                    .save()
                    .fillColor('#f0f0f0')
                    .rect(x, y, columnWidth, cellHeight)
                    .fill()
                    .restore()
                    .stroke();
                doc.rect(x, y, columnWidth, cellHeight).stroke();
                const textWidth1 = doc.widthOfString(row[0]);
                const textWidth2 = doc.widthOfString(row[1]);
                const textX1 = x + (columnWidth - textWidth1) / 2;
                const textX2 = x + columnWidth + (columnWidth - textWidth2) / 2;
                const textY = y + (cellHeight - 6) / 2;
                doc.font('Helvetica-Bold').text(row[0], textX1, textY);
                doc.rect(x + columnWidth, y, columnWidth, cellHeight).stroke();
                doc.font('Helvetica').text(row[1], textX2, textY);
            });
            const cellXVolt = startX;
            const cellYVolt = currentY + 80;
            const titleCellWidth = 116;
            const dataCellWidth = 53;
            const specialDataCellWidth = 65;
            const cellHeightVolt = 20;
            const cellTexts = [
                'Voltaje del Equipo',
                inventory.voltage,
                'Peso del Equipo',
                inventory.weight,
                'Potencia del Equipo',
                inventory.power,
            ];
            let currentX = cellXVolt;
            cellTexts.forEach((text, index) => {
                const isTitle = index % 2 === 0;
                const isSpecialCell = index === cellTexts.length - 1;
                const cellWidth = isTitle
                    ? titleCellWidth
                    : isSpecialCell
                        ? specialDataCellWidth
                        : dataCellWidth;
                if (isTitle) {
                    doc
                        .rect(currentX, cellYVolt, cellWidth, cellHeightVolt)
                        .fill('#f0f0f0');
                }
                doc.rect(currentX, cellYVolt, cellWidth, cellHeightVolt).stroke();
                doc.fillColor('black').font('Helvetica');
                doc.font(isTitle ? 'Helvetica-Bold' : 'Helvetica');
                doc.text(text, currentX, cellYVolt + cellHeightVolt / 3, {
                    width: cellWidth,
                    align: 'center',
                });
                currentX += cellWidth;
            });
            currentY += Math.ceil(generalData.length / 2) * cellHeight + 20;
            let containerY = 237;
            const cellHeightSpec = 25;
            const columnWidths = [150, 300, 70];
            const startXspec = 50;
            let currentYspec = containerY;
            doc
                .save()
                .fillColor('#f0f0f0')
                .rect(startXspec, currentYspec, columnWidths[0], cellHeightSpec)
                .fill()
                .restore()
                .stroke();
            doc
                .rect(startXspec, currentYspec, columnWidths[0], cellHeightSpec)
                .stroke();
            doc
                .font('Helvetica-Bold')
                .text('Especificaciones Técnicas', startXspec + 5, currentYspec + 9, {
                width: columnWidths[0] - 10,
                align: 'center',
            });
            doc
                .save()
                .fillColor('#f0f0f0')
                .rect(startXspec + columnWidths[0], currentYspec, columnWidths[1], cellHeightSpec)
                .fill()
                .restore();
            doc
                .rect(startXspec + columnWidths[0], currentYspec, columnWidths[1], cellHeightSpec)
                .stroke();
            doc.text('Tecnología Predominante', startXspec + columnWidths[0] + 5, currentYspec + 9, { width: columnWidths[1] - 10, align: 'center' });
            doc
                .save()
                .fillColor('#f0f0f0')
                .rect(startXspec + columnWidths[0] + columnWidths[1], currentYspec, columnWidths[2], cellHeightSpec)
                .fill()
                .restore();
            doc
                .rect(startXspec + columnWidths[0] + columnWidths[1], currentYspec, columnWidths[2], cellHeightSpec)
                .stroke();
            doc.text('Uso', startXspec + columnWidths[0] + columnWidths[1] + 5, currentYspec + 9, { width: columnWidths[2] - 10, align: 'center' });
            const specifications = [
                ['Capacidad', inventory.capacity || 'No disponible'],
                ['Material', inventory.material || 'No disponible'],
            ];
            specifications.forEach((row) => {
                const cellWidth = 75;
                const cellHeight = 20;
                doc
                    .save()
                    .fillColor('#f0f0f0')
                    .rect(50, containerY + cellHeight + 4, cellWidth, cellHeight)
                    .fill()
                    .restore();
                doc
                    .rect(50, containerY + cellHeight + 4, cellWidth, cellHeight)
                    .stroke();
                doc
                    .rect(125, containerY + cellHeight + 4, cellWidth, cellHeight)
                    .stroke();
                const textWidth1 = doc.widthOfString(row[0]);
                const textWidth2 = doc.widthOfString(row[1]);
                const textX1 = 50 + (cellWidth - textWidth1) / 2;
                const textX2 = 125 + (cellWidth - textWidth2) / 2;
                const textY = containerY + (cellHeight - 6) / 2;
                doc.font('Helvetica-Bold').text(row[0], textX1, textY + cellHeight + 4);
                doc.font('Helvetica').text(row[1], textX2, textY + cellHeight + 4);
                containerY += cellHeight;
            });
            const cellXcell = 200;
            const cellWidth = 150;
            const cellHeightcell = 20;
            const text = 'Dimensiones del equipo';
            const cellYcell = containerY + 4;
            doc
                .save()
                .fillColor('#f0f0f0')
                .rect(cellXcell, cellYcell, cellWidth, cellHeightcell)
                .fill()
                .restore();
            doc.rect(cellXcell, cellYcell, cellWidth, cellHeightcell).stroke();
            const textWidth = doc.widthOfString(text);
            const textHeight = 5;
            const textX = cellXcell + (cellWidth - textWidth) / 2;
            const textY = cellYcell + (cellHeightcell - textHeight) / 2;
            doc.font('Helvetica-Bold').text(text, textX, textY);
            const cellXsize = 350;
            const cellYsize = containerY + 4;
            const cellWidthsize = 150;
            const cellHeightsize = 20;
            const textsize = '40x30x10cm';
            doc.rect(cellXsize, cellYsize, cellWidthsize, cellHeightsize).stroke();
            const textWidthsize = doc.widthOfString(textsize);
            const textHeightsize = 5;
            const textXsize = cellXsize + (cellWidthsize - textWidthsize) / 2;
            const textYsize = cellYsize + (cellHeightsize - textHeightsize) / 2;
            doc.font('Helvetica').text(textsize, textXsize, textYsize);
            const startY = containerY - 16;
            const data = [
                'Mecánico',
                'Eléctrico',
                'Hidráulico',
                'Electrónico',
                'Neumático',
            ];
            data.forEach((text, index) => {
                const x = 200 + index * 60;
                doc.rect(x, startY, 60, cellHeight).stroke();
                const textWidth = doc.widthOfString(text);
                const textHeight = doc.currentLineHeight();
                const textX = x + (60 - textWidth) / 2;
                const textY = startY + (18 - textHeight) / 2;
                doc.text(text, textX, textY);
                const cellWidth = 35;
                const cellHeightcell = 39;
                const startXcell = 500;
                const startYcell = startY;
                if (inventory.technology ===
                    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
                    doc
                        .moveTo(x, startY)
                        .lineTo(x + 60, startY + cellHeight)
                        .stroke();
                    doc
                        .moveTo(x + 60, startY)
                        .lineTo(x, startY + cellHeight)
                        .stroke();
                }
                doc
                    .rect(startXcell, startYcell + 1, cellWidth, cellHeightcell)
                    .stroke();
                if (inventory.usage === 'Fijo') {
                    doc
                        .moveTo(startXcell, startYcell)
                        .lineTo(startXcell + cellWidth, startYcell + cellHeightcell)
                        .stroke();
                    doc
                        .moveTo(startXcell + cellWidth, startYcell)
                        .lineTo(startXcell, startYcell + cellHeightcell)
                        .stroke();
                }
                doc
                    .font('Helvetica')
                    .fontSize(8)
                    .text('Fijo', startXcell + 5, startYcell + 17, {
                    width: cellWidth - 10,
                    align: 'center',
                });
                doc
                    .rect(startXcell + cellWidth, startYcell + 1, cellWidth, cellHeightcell)
                    .stroke();
                doc
                    .font('Helvetica')
                    .fontSize(8)
                    .text('Móvil', startXcell + cellWidth + 5, startYcell + 17, {
                    width: cellWidth - 10,
                    align: 'center',
                });
                if (inventory.usage === 'Movil') {
                    doc
                        .moveTo(startXcell + cellWidth, startYcell)
                        .lineTo(startXcell + 2 * cellWidth, startYcell + cellHeightcell)
                        .stroke();
                    doc
                        .moveTo(startXcell + 2 * cellWidth, startYcell)
                        .lineTo(startXcell + cellWidth, startYcell + cellHeightcell)
                        .stroke();
                }
                doc
                    .font('Helvetica')
                    .fontSize(8)
                    .text('Móvil', startXcell + cellWidth + 5, startYcell + 17, {
                    width: cellWidth - 10,
                    align: 'center',
                });
            });
            doc.end();
        });
    }
    async findAll() {
        return this.inventoryModel.find().exec();
    }
    async findOne(id) {
        return this.inventoryModel.findById(id).exec();
    }
    async update(id, data) {
        return this.inventoryModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }
    async delete(id) {
        return this.inventoryModel.findByIdAndDelete(id).exec();
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_schema_1.Inventory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map