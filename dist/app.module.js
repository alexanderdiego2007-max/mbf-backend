"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_module_1 = require("./users/users.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const mailer_service_1 = require("./mailer/mailer.service");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const inventory_module_1 = require("./inventory/inventory.module");
const equipment_module_1 = require("./equipment/equipment.module");
const events_module_1 = require("./events/events.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRoot('mongodb+srv://alexanderdiego2007:diegonacional123@cluster0.lnrft.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'assets'),
                serveRoot: '/assets',
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            axios_1.HttpModule,
            inventory_module_1.InventoryModule,
            equipment_module_1.EquipmentModule,
            events_module_1.EventsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, mailer_service_1.MailerService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map