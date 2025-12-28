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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySchema = exports.Inventory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Inventory = class Inventory {
};
exports.Inventory = Inventory;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Inventory.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Inventory.prototype, "brand", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Inventory.prototype, "model", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Inventory.prototype, "serialNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Inventory.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Inventory.prototype, "purchaseDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Inventory.prototype, "voltage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Inventory.prototype, "power", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Inventory.prototype, "weight", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Inventory.prototype, "capacity", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Inventory.prototype, "material", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['Fijo', 'Movil'] }),
    __metadata("design:type", String)
], Inventory.prototype, "usage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['Mecanico', 'Electrico', 'Hidraulico', 'Electronico', 'Neumatico'],
    }),
    __metadata("design:type", String)
], Inventory.prototype, "technology", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['Baja', 'Media', 'Alta'] }),
    __metadata("design:type", String)
], Inventory.prototype, "maintenancePriority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, sparse: true }),
    __metadata("design:type", String)
], Inventory.prototype, "FT", void 0);
exports.Inventory = Inventory = __decorate([
    (0, mongoose_1.Schema)()
], Inventory);
exports.InventorySchema = mongoose_1.SchemaFactory.createForClass(Inventory);
//# sourceMappingURL=inventory.schema.js.map