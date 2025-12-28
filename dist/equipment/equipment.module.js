"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const equipment_schema_1 = require("./equipment.schema");
const equipment_service_1 = require("./equipment.service");
const equipment_controller_1 = require("./equipment.controller");
const users_module_1 = require("../users/users.module");
const user_schema_1 = require("../users/user.schema");
let EquipmentModule = class EquipmentModule {
};
exports.EquipmentModule = EquipmentModule;
exports.EquipmentModule = EquipmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: equipment_schema_1.Equipment.name, schema: equipment_schema_1.EquipmentSchema },
                { name: 'User', schema: user_schema_1.UserSchema },
            ]), users_module_1.UsersModule
        ],
        controllers: [equipment_controller_1.EquipmentController],
        providers: [equipment_service_1.EquipmentService],
    })
], EquipmentModule);
//# sourceMappingURL=equipment.module.js.map