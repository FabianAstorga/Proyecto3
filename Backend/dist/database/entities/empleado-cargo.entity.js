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
exports.EmpleadoCargo = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./usuario.entity");
const cargo_entity_1 = require("./cargo.entity");
let EmpleadoCargo = class EmpleadoCargo {
    id;
    usuario;
    cargo;
};
exports.EmpleadoCargo = EmpleadoCargo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmpleadoCargo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.cargos, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario" }),
    __metadata("design:type", usuario_entity_1.Usuario)
], EmpleadoCargo.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cargo_entity_1.Cargo, (cargo) => cargo.empleados, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "id_cargo" }),
    __metadata("design:type", cargo_entity_1.Cargo)
], EmpleadoCargo.prototype, "cargo", void 0);
exports.EmpleadoCargo = EmpleadoCargo = __decorate([
    (0, typeorm_1.Entity)("empleado_cargo")
], EmpleadoCargo);
//# sourceMappingURL=empleado-cargo.entity.js.map