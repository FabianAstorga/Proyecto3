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
exports.Cargo = void 0;
const typeorm_1 = require("typeorm");
const empleado_cargo_entity_1 = require("./empleado-cargo.entity");
let Cargo = class Cargo {
    id_cargo;
    ocupacion;
    descripcion;
    empleados;
};
exports.Cargo = Cargo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Cargo.prototype, "id_cargo", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Cargo.prototype, "ocupacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Cargo.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => empleado_cargo_entity_1.EmpleadoCargo, (ec) => ec.cargo),
    __metadata("design:type", Array)
], Cargo.prototype, "empleados", void 0);
exports.Cargo = Cargo = __decorate([
    (0, typeorm_1.Entity)('cargo')
], Cargo);
//# sourceMappingURL=cargo.entity.js.map