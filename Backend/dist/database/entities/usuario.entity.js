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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const empleado_cargo_entity_1 = require("./empleado-cargo.entity");
const informe_entity_1 = require("./informe.entity");
const horario_entity_1 = require("./horario.entity");
const actividad_entity_1 = require("./actividad.entity");
let Usuario = class Usuario {
    id;
    rol;
    nombre;
    apellido;
    correo;
    contrasena;
    estado;
    telefono;
    foto_url;
    fecha_creacion;
    cargos;
    informes;
    horarios;
    actividades;
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'int' }),
    __metadata("design:type", Number)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['funcionario', 'secretaria', 'administrador'],
        default: 'funcionario',
    }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Usuario.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Usuario.prototype, "apellido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Usuario.prototype, "correo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, select: false }),
    __metadata("design:type", String)
], Usuario.prototype, "contrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Usuario.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "foto_url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Usuario.prototype, "fecha_creacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => empleado_cargo_entity_1.EmpleadoCargo, (ec) => ec.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "cargos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => informe_entity_1.Informe, (i) => i.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "informes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => horario_entity_1.Horario, horario => horario.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "horarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => actividad_entity_1.Actividad, (actividad) => actividad.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "actividades", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)('usuario')
], Usuario);
//# sourceMappingURL=usuario.entity.js.map