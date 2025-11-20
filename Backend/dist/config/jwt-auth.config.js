"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const jwtConfig = () => ({
    secret: process.env.JWT_SECRET || 'clave_super_secreta',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
});
exports.jwtConfig = jwtConfig;
//# sourceMappingURL=jwt-auth.config.js.map