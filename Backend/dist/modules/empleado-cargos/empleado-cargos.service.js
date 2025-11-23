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
exports.EmpleadoCargoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const empleado_cargo_entity_1 = require("../../database/entities/empleado-cargo.entity");
let EmpleadoCargoService = class EmpleadoCargoService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(dto) {
        const nuevo = this.repository.create({
            usuario: { id: dto.id_usuario },
            cargo: { id: dto.id_cargo },
        });
        return this.repository.save(nuevo);
    }
    async findAll() {
        return this.repository.find({ relations: ["usuario", "cargo"] });
    }
    async findOne(id) {
        const registro = await this.repository.findOne({
            where: { id },
            relations: ["usuario", "cargo"],
        });
        if (!registro)
            throw new common_1.NotFoundException(`EmpleadoCargo #${id} no encontrado`);
        return registro;
    }
    async update(id, dto) {
        const registro = await this.findOne(id);
        if (dto.id_usuario)
            registro.usuario = { id: dto.id_usuario };
        if (dto.id_cargo)
            registro.cargo = { id: dto.id_cargo };
        return this.repository.save(registro);
    }
    async remove(id) {
        const registro = await this.findOne(id);
        await this.repository.remove(registro);
    }
    async findByUser(usuarioId) {
        return this.repository.find({
            where: { usuario: { id: usuarioId } },
            relations: ["usuario", "cargo"],
        });
    }
};
exports.EmpleadoCargoService = EmpleadoCargoService;
exports.EmpleadoCargoService = EmpleadoCargoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(empleado_cargo_entity_1.EmpleadoCargo)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmpleadoCargoService);
//# sourceMappingURL=empleado-cargos.service.js.map