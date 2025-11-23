"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpleadoCargosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const empleado_cargo_entity_1 = require("../../database/entities/empleado-cargo.entity");
const empleado_cargos_controller_1 = require("./empleado-cargos.controller");
const empleado_cargos_service_1 = require("./empleado-cargos.service");
let EmpleadoCargosModule = class EmpleadoCargosModule {
};
exports.EmpleadoCargosModule = EmpleadoCargosModule;
exports.EmpleadoCargosModule = EmpleadoCargosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([empleado_cargo_entity_1.EmpleadoCargo])],
        controllers: [empleado_cargos_controller_1.EmpleadoCargoController],
        providers: [empleado_cargos_service_1.EmpleadoCargoService],
    })
], EmpleadoCargosModule);
//# sourceMappingURL=empleado-cargos.module.js.map