import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/database/entities/usuario.entity';
import { Cargo } from 'src/database/entities/cargo.entity';
import { EmpleadoCargo } from 'src/database/entities/empleado-cargo.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([Usuario, Cargo, EmpleadoCargo]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'mi_secreto_super_seguro',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '2h',
        },
      }),
    }),
    UsuariosModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
