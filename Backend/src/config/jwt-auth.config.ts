export const jwtConfig = () => ({
  secret: process.env.JWT_SECRET || 'clave_super_secreta',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
});