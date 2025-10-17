import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt-auth.config';
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig], // carga la configuración de la base de datos
    }),
  ],
})
export class ConfigModule {}