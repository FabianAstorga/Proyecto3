/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      // 🔹 Función síncrona (no uses async si no haces await)
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET') || 'mi_secreto_por_defecto';
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '3600s';

        return {
          secret,
          signOptions: {
            // 👇 Forzamos el tipo para que TypeScript acepte el valor tipo string
            expiresIn: expiresIn as unknown as number | undefined,
          },
        };
      },
    }),

    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
