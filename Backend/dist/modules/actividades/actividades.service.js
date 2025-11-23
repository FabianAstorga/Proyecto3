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
const create_actividad_dto_1 = require("./dto/create-actividad.dto");
const actividad_entity_1 = require("../../database/entities/actividad.entity");
const usuario_entity_1 = require("../../database/entities/usuario.entity");
const informes_service_1 = require("../informes/informes.service");
let ActividadService = class ActividadService {
    actividadRepository;
    usuarioRepository;
    informesService;
    constructor(actividadRepository, usuarioRepository, informesService) {
        this.actividadRepository = actividadRepository;
        this.usuarioRepository = usuarioRepository;
        this.informesService = informesService;
    }
    async create(dto, userId) {
        switch (dto.modo) {
            case create_actividad_dto_1.ModoCreacion.SIMPLE:
                return this.crearSimple(dto, userId);
            case create_actividad_dto_1.ModoCreacion.FECHAS_ESPECIFICAS:
                return this.crearConFechasEspecificas(dto, userId);
            case create_actividad_dto_1.ModoCreacion.REPETICION_SEMANAL:
                return this.crearConRepeticionSemanal(dto, userId);
            default:
                throw new common_1.BadRequestException('Modo de creación no válido.');
        }
    }
    async crearSimple(dto, userId) {
        if (!dto.fecha) {
            throw new common_1.BadRequestException('Se requiere fecha para el modo simple.');
        }
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const fecha = new Date(dto.fecha);
        const informe = await this.informesService.obtenerOCrearInforme(userId, fecha);
        const actividad = this.actividadRepository.create({
            titulo: dto.titulo,
            tipo: dto.tipo,
            estado: dto.estado || false,
            descripcion: dto.descripcion,
            fecha: fecha,
            informe: informe,
            usuario: usuario,
            esRepetitiva: false,
        });
        return this.actividadRepository.save(actividad);
    }
    async crearConFechasEspecificas(dto, userId) {
        if (!dto.fechas_especificas || dto.fechas_especificas.length === 0) {
            throw new common_1.BadRequestException('Se requieren fechas_especificas para este modo.');
        }
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const actividades = [];
        for (const f of dto.fechas_especificas) {
            const fecha = new Date(f.fecha);
            const informe = await this.informesService.obtenerOCrearInforme(userId, fecha);
            const actividad = this.actividadRepository.create({
                titulo: dto.titulo,
                tipo: dto.tipo,
                estado: dto.estado || false,
                descripcion: dto.descripcion,
                fecha: fecha,
                informe: informe,
                usuario: usuario,
                esRepetitiva: false,
            });
            actividades.push(actividad);
        }
        return this.actividadRepository.save(actividades);
    }
    async crearConRepeticionSemanal(dto, userId) {
        if (!dto.fecha_desde || !dto.fecha_hasta || !dto.dias_semana || dto.dias_semana.length === 0) {
            throw new common_1.BadRequestException('Se requieren fecha_desde, fecha_hasta y dias_semana para este modo.');
        }
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const fechasGeneradas = this.generarFechasPorDiasSemana(dto.fecha_desde, dto.fecha_hasta, dto.dias_semana);
        if (fechasGeneradas.length === 0) {
            throw new common_1.BadRequestException('No se generaron fechas con los días seleccionados.');
        }
        const actividades = [];
        for (const fecha of fechasGeneradas) {
            const informe = await this.informesService.obtenerOCrearInforme(userId, fecha);
            const actividad = this.actividadRepository.create({
                titulo: dto.titulo,
                tipo: dto.tipo,
                estado: dto.estado || false,
                descripcion: dto.descripcion,
                fecha: fecha,
                informe: informe,
                usuario: usuario,
                esRepetitiva: true,
            });
            actividades.push(actividad);
        }
        return this.actividadRepository.save(actividades);
    }
    generarFechasPorDiasSemana(desde, hasta, diasSeleccionados) {
        const mapaDias = {
            'Domingo': 0,
            'Lunes': 1,
            'Martes': 2,
            'Miércoles': 3,
            'Jueves': 4,
            'Viernes': 5,
            'Sábado': 6,
        };
        const diasNumeros = diasSeleccionados
            .map((d) => mapaDias[d])
            .filter((n) => n !== undefined);
        if (diasNumeros.length === 0) {
            return [];
        }
        const inicio = new Date(desde);
        const fin = new Date(hasta);
        const fechas = [];
        for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
            if (diasNumeros.includes(d.getDay())) {
                fechas.push(new Date(d));
            }
        }
        return fechas;
    }
    findAll() {
        return this.actividadRepository.find({
            relations: ['informe', 'usuario'],
        });
    }
    findByUser(userId) {
        return this.actividadRepository.find({
            where: { usuario: { id: userId } },
            relations: ['informe', 'usuario'],
            order: { fecha: 'DESC' },
        });
    }
    findOne(id) {
        return this.actividadRepository.findOne({
            where: { id_actividad: id },
            relations: ['informe', 'usuario'],
        });
    }
    async update(id, dto) {
        await this.actividadRepository.update(id, dto);
        return this.findOne(id);
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
        typeorm_2.Repository,
        informes_service_1.InformesService])
], ActividadService);
//# sourceMappingURL=actividades.service.js.map