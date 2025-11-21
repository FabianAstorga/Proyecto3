"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const usuarios_service_1 = require("../usuarios/usuarios.service");
let AuthService = class AuthService {
    usuariosService;
    jwtService;
    constructor(usuariosService, jwtService) {
        this.usuariosService = usuariosService;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const existingUser = await this.usuariosService.findOneByEmail(registerDto.correo);
        if (existingUser) {
            throw new common_1.ConflictException('❌ Este correo ya está registrado.');
        }
        if (registerDto.contrasena.length < 8) {
            throw new common_1.BadRequestException('❌ La contraseña debe tener al menos 8 caracteres.');
        }
        const rol = registerDto.rol || 'funcionario';
        const createUsuarioDto = {
            correo: registerDto.correo,
            contrasena: registerDto.contrasena,
            nombre: registerDto.nombre,
            apellido: registerDto.apellido,
            telefono: registerDto.telefono,
            rol: rol,
        };
        const usuario = await this.usuariosService.create(createUsuarioDto);
        const payload = {
            sub: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
        };
        const token = this.jwtService.sign(payload);
        const { contrasena, ...usuarioSinContrasena } = usuario;
        return '✔ Usuario registrado exitosamente. ';
    }
    async login(loginDto) {
        const user = await this.usuariosService.findOneByEmailWithPassword(loginDto.correo);
        if (!user)
            throw new common_1.UnauthorizedException('❌ Correo o contraseña incorrectos.');
        const match = await bcrypt.compare(loginDto.contrasena, user.contrasena);
        if (!match)
            throw new common_1.UnauthorizedException('❌ Correo o contraseña incorrectos.');
        const payload = {
            sub: user.id,
            correo: user.correo,
            rol: user.rol,
        };
        const token = this.jwtService.sign(payload);
        const { contrasena, ...usuarioSinContrasena } = user;
        return {
            access_token: token,
            user: usuarioSinContrasena,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map