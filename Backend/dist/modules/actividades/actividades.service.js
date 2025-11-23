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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActividadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const actividad_entity_1 = require("../../database/entities/actividad.entity");
const usuario_entity_1 = require("../../database/entities/usuario.entity");
let ActividadService = class ActividadService {
    actividadRepository;
    usuarioRepository;
    constructor(actividadRepository, usuarioRepository) {
        this.actividadRepository = actividadRepository;
        this.usuarioRepository = usuarioRepository;
    }
    async create(dto, userId) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
        });
        if (!usuario) {
            throw new common_1.NotFoundException("Usuario no encontrado para la actividad");
        }
        const actividad = this.actividadRepository.create({
            ...dto,
            usuario,
        });
        return this.actividadRepository.save(actividad);
    }
    findAll() {
        return this.actividadRepository.find({
            relations: ["informe", "usuario"],
        });
    }
    findOne(id) {
        return this.actividadRepository.findOne({
            where: { id_actividad: id },
            relations: ["informe", "usuario"],
        });
    }
    remove(id) {
        return this.actividadRepository.delete(id);
    }
};
exports.ActividadService = ActividadService;
exports.ActividadService = ActividadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(actividad_entity_1.Actividad)),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ActividadService);
//# sourceMappingURL=actividades.service.js.map