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
exports.CargosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cargo_entity_1 = require("../../database/entities/cargo.entity");
let CargosService = class CargosService {
    cargoRepository;
    constructor(cargoRepository) {
        this.cargoRepository = cargoRepository;
    }
    async create(dto) {
        const existente = await this.cargoRepository.findOne({
            where: { ocupacion: dto.ocupacion },
        });
        if (existente)
            throw new common_1.ConflictException(`El cargo ${dto.ocupacion} ya existe.`);
        const cargo = this.cargoRepository.create(dto);
        return this.cargoRepository.save(cargo);
    }
    findAll() {
        return this.cargoRepository.find();
    }
    async findOne(id) {
        const cargo = await this.cargoRepository.findOne({
            where: { id_cargo: id },
        });
        if (!cargo)
            throw new common_1.NotFoundException(`Cargo con ID ${id} no encontrado.`);
        return cargo;
    }
    async update(id, dto) {
        const cargo = await this.findOne(id);
        Object.assign(cargo, dto);
        return this.cargoRepository.save(cargo);
    }
    async remove(id) {
        const cargo = await this.findOne(id);
        return this.cargoRepository.remove(cargo);
    }
};
exports.CargosService = CargosService;
exports.CargosService = CargosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cargo_entity_1.Cargo)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CargosService);
//# sourceMappingURL=cargos.service.js.map