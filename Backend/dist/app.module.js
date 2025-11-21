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
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const config_module_1 = require("./config/config.module");
const auth_module_1 = require("./modules/auth/auth.module");
const actividades_module_1 = require("./modules/actividades/actividades.module");
const empleado_cargos_module_1 = require("./modules/empleado-cargos/empleado-cargos.module");
const cargos_module_1 = require("./modules/cargos/cargos.module");
const informes_module_1 = require("./modules/informes/informes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            config_module_1.ConfigModule,
            auth_module_1.AuthModule,
            actividades_module_1.ActividadesModule,
            empleado_cargos_module_1.EmpleadoCargosModule,
            cargos_module_1.CargosModule,
            informes_module_1.InformesModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map