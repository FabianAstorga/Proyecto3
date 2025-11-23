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
exports.InformesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const informe_entity_1 = require("../../database/entities/informe.entity");
const usuario_entity_1 = require("../../database/entities/usuario.entity");
let InformesService = class InformesService {
    informeRepository;
    usuarioRepository;
    constructor(informeRepository, usuarioRepository) {
        this.informeRepository = informeRepository;
        this.usuarioRepository = usuarioRepository;
    }
    async obtenerOCrearInforme(usuarioId, fecha) {
        const periodo = this.extraerPeriodo(fecha);
        let informe = await this.informeRepository.findOne({
            where: {
                usuario: { id: usuarioId },
                periodo: periodo,
            },
        });
        if (!informe) {
            const usuario = await this.usuarioRepository.findOne({
                where: { id: usuarioId },
            });
            if (!usuario) {
                throw new common_1.NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
            }
            informe = this.informeRepository.create({
                periodo: periodo,
                usuario: usuario,
                estado: 'pendiente',
            });
            informe = await this.informeRepository.save(informe);
        }
        return informe;
    }
    extraerPeriodo(fecha) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();
        return `${mes} ${año}`;
    }
    findByUsuario(usuarioId) {
        return this.informeRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: ['actividades'],
            order: { id_informe: 'DESC' },
        });
    }
    findOne(id) {
        return this.informeRepository.findOne({
            where: { id_informe: id },
            relations: ['actividades', 'usuario'],
        });
    }
    async marcarComoEnviado(id) {
        await this.informeRepository.update(id, {
            fechaEnvio: new Date(),
            estado: 'enviado',
        });
        return this.findOne(id);
    }
};
exports.InformesService = InformesService;
exports.InformesService = InformesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(informe_entity_1.Informe)),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InformesService);
//# sourceMappingURL=informes.service.js.map