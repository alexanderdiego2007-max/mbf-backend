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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const QRCode = require("qrcode");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async create(createDto) {
        return this.inventoryService.create(createDto);
    }
    async findAll() {
        return this.inventoryService.findAll();
    }
    async findOne(id) {
        return this.inventoryService.findOne(id);
    }
    async update(id, updateDto) {
        return this.inventoryService.update(id, updateDto);
    }
    async delete(id) {
        return this.inventoryService.delete(id);
    }
    async generateQR(id, res) {
        try {
            const inventory = await this.inventoryService.findOne(id);
            if (!inventory) {
                throw new common_1.HttpException('Inventario no encontrado', common_1.HttpStatus.NOT_FOUND);
            }
            const qrData = id;
            const qrImage = await QRCode.toDataURL(qrData);
            const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
            const imgBuffer = Buffer.from(base64Data, 'base64');
            res.setHeader('Content-Type', 'image/png');
            res.send(imgBuffer);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generatePDF(id, res) {
        try {
            const inventory = await this.inventoryService.findOne(id);
            if (!inventory) {
                throw new common_1.HttpException('Inventario no encontrado', common_1.HttpStatus.NOT_FOUND);
            }
            const pdfBuffer = await this.inventoryService.generatePDF(inventory);
            const base64PDF = pdfBuffer.toString('base64');
            res.status(common_1.HttpStatus.OK).json({
                message: 'PDF generado correctamente',
                base64: base64PDF,
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('generate-qr/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "generateQR", null);
__decorate([
    (0, common_1.Get)('generate-pdf/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "generatePDF", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map