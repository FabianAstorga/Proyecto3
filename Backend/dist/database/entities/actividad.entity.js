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
exports.Actividad = void 0;
const typeorm_1 = require("typeorm");
const informe_entity_1 = require("./informe.entity");
const usuario_entity_1 = require("./usuario.entity");
let Actividad = class Actividad {
    id_actividad;
    titulo;
    descripcion;
    fecha;
    tipo;
    estado;
    esRepetitiva;
    usuario;
    informe;
};
exports.Actividad = Actividad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Actividad.prototype, "id_actividad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Actividad.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Actividad.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Actividad.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Actividad.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Actividad.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Actividad.prototype, "esRepetitiva", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.actividades, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Actividad.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => informe_entity_1.Informe, (informe) => informe.actividades, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", informe_entity_1.Informe)
], Actividad.prototype, "informe", void 0);
exports.Actividad = Actividad = __decorate([
    (0, typeorm_1.Entity)('actividad')
], Actividad);
//# sourceMappingURL=actividad.entity.js.map