"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadesModule = void 0;
const common_1 = require("@nestjs/common");
const actividades_service_1 = require("./actividades.service");
const actividades_controller_1 = require("./actividades.controller");
const typeorm_1 = require("@nestjs/typeorm");
const actividad_entity_1 = require("../../database/entities/actividad.entity");
const usuario_entity_1 = require("../../database/entities/usuario.entity");
let ActividadesModule = class ActividadesModule {
};
exports.ActividadesModule = ActividadesModule;
exports.ActividadesModule = ActividadesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([actividad_entity_1.Actividad, usuario_entity_1.Usuario])],
        controllers: [actividades_controller_1.ActividadController],
        providers: [actividades_service_1.ActividadService],
    })
], ActividadesModule);
//# sourceMappingURL=actividades.module.js.map