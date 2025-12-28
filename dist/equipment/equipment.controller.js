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
exports.EquipmentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const equipment_service_1 = require("./equipment.service");
let EquipmentController = class EquipmentController {
    constructor(service) {
        this.service = service;
    }
    async create(data, files) {
        try {
            const photos = [
                files.photo_0?.[0],
                files.photo_1?.[0],
                files.photo_2?.[0],
            ].filter(Boolean);
            const invoice = files.invoice?.[0] || null;
            return await this.service.create({ ...data }, photos, invoice);
        }
        catch (error) {
            throw new common_1.HttpException(`Error al crear el equipo: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(technicianName, email) {
        if (email) {
            return this.service.findByEmail(email);
        }
        if (technicianName) {
            return this.service.findByTechnician(technicianName);
        }
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async getPhotos(id, res) {
        try {
            const photos = await this.service.getPhotos(id);
            if (!photos || photos.length === 0) {
                return res.status(404).json({ message: 'Fotos no encontradas.' });
            }
            res.json(photos.map((photo) => ({
                buffer: photo.toString('base64'),
            })));
        }
        catch (error) {
            res.status(500).json({ message: 'Error al obtener las fotos.' });
        }
    }
    async getInvoice(id, res) {
        try {
            const base64Invoice = await this.service.getInvoice(id);
            res.json({ invoice: base64Invoice });
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async update(id, data, files) {
        console.log('Body recibido:', data);
        try {
            const photos = [
                files.photo_0?.[0],
                files.photo_1?.[0],
                files.photo_2?.[0],
            ].filter(Boolean);
            const invoice = files.invoice?.[0] || null;
            return await this.service.update(id, {
                ...data,
                authorizationDate: data.authorizationDate ? new Date(data.authorizationDate) : undefined,
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
            }, photos, invoice);
        }
        catch (error) {
            if (error.message?.includes('is required')) {
                const field = error.message.split(' ')[0];
                throw new common_1.HttpException(`Falta el campo obligatorio '${field}' al actualizar el equipo.`, common_1.HttpStatus.BAD_REQUEST);
            }
            if (error.name === 'ValidationError') {
                const fields = Object.keys(error.errors || {});
                const fieldList = fields.join(', ');
                throw new common_1.HttpException(`Error de validación en los campos: ${fieldList}`, common_1.HttpStatus.BAD_REQUEST);
            }
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                throw new common_1.HttpException(`Ya existe un equipo con el mismo valor en el campo '${field}'.`, common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException(`Error al actualizar el equipo: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(id) {
        return this.service.delete(id);
    }
    async deletePhoto(id, photoUrl) {
        try {
            const updatedEquipment = await this.service.removePhoto(id, photoUrl);
            return { message: 'Foto eliminada correctamente', equipment: updatedEquipment };
        }
        catch (error) {
            throw new common_1.HttpException(`Error al eliminar la foto: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generatePDF(id, res) {
        try {
            const equipment = await this.service.findOne(id);
            if (!equipment) {
                throw new common_1.HttpException('Inventario no encontrado', common_1.HttpStatus.NOT_FOUND);
            }
            const pdfBuffer = await this.service.generatePDF(equipment);
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
    async updateCustomerApproval(id, approval) {
        return this.service.updateCustomerApproval(id, approval);
    }
};
exports.EquipmentController = EquipmentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'photo_0', maxCount: 1 },
        { name: 'photo_1', maxCount: 1 },
        { name: 'photo_2', maxCount: 1 },
        { name: 'invoice', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('technicianName')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/photos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "getPhotos", null);
__decorate([
    (0, common_1.Get)(':id/invoice'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'photo_0', maxCount: 1 },
        { name: 'photo_1', maxCount: 1 },
        { name: 'photo_2', maxCount: 1 },
        { name: 'invoice', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/photo'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('photoUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "deletePhoto", null);
__decorate([
    (0, common_1.Get)('generate-pdf/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "generatePDF", null);
__decorate([
    (0, common_1.Patch)(':id/customer-approval'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('approval')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "updateCustomerApproval", null);
exports.EquipmentController = EquipmentController = __decorate([
    (0, common_1.Controller)('equipment'),
    __metadata("design:paramtypes", [equipment_service_1.EquipmentService])
], EquipmentController);
//# sourceMappingURL=equipment.controller.js.map