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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
class RegisterDto {
    correo;
    contrasena;
    nombre;
    apellido;
    telefono;
    foto_url;
    rol;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'El correo debe tener un formato válido.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "correo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La contraseña no puede estar vacía.' }),
    (0, class_validator_1.MinLength)(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "contrasena", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es obligatorio.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El apellido es obligatorio.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "apellido", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)('CL', { message: 'Debe ingresar un número de teléfono válido de Chile.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La URL de la foto no puede estar vacía.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "foto_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['funcionario', 'secretaria', 'administrador'], {
        message: 'El rol debe ser funcionario, secretaria o administrador.',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "rol", void 0);
//# sourceMappingURL=register.dto.js.map