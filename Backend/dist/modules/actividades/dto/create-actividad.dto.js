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
exports.CreateActividadDto = exports.FechaEspecificaDto = exports.ModoCreacion = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ModoCreacion;
(function (ModoCreacion) {
    ModoCreacion["SIMPLE"] = "simple";
    ModoCreacion["FECHAS_ESPECIFICAS"] = "fechas_especificas";
    ModoCreacion["REPETICION_SEMANAL"] = "repeticion_semanal";
})(ModoCreacion || (exports.ModoCreacion = ModoCreacion = {}));
class FechaEspecificaDto {
    fecha;
}
exports.FechaEspecificaDto = FechaEspecificaDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FechaEspecificaDto.prototype, "fecha", void 0);
class CreateActividadDto {
    titulo;
    tipo;
    estado;
    descripcion;
    esRepetitiva;
    modo;
    fecha;
    fechas_especificas;
    fecha_desde;
    fecha_hasta;
    dias_semana;
}
exports.CreateActividadDto = CreateActividadDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El título es obligatorio.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de actividad es obligatorio.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El estado es obligatorio.' }),
    (0, class_validator_1.IsEnum)(['Pendiente', 'En Progreso', 'Realizada', 'Cancelada']),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateActividadDto.prototype, "esRepetitiva", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El modo de creación es obligatorio.' }),
    (0, class_validator_1.IsEnum)(ModoCreacion),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "modo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FechaEspecificaDto),
    __metadata("design:type", Array)
], CreateActividadDto.prototype, "fechas_especificas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "fecha_desde", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "fecha_hasta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateActividadDto.prototype, "dias_semana", void 0);
//# sourceMappingURL=create-actividad.dto.js.map