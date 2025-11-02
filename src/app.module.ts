import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActividadesModule } from './modules/actividades/actividades.module';
import { EmpleadoCargosModule } from './modules/empleado-cargos/empleado-cargos.module';
import { SalasModule } from './modules/salas/salas.module';
import { OficinasModule } from './modules/oficinas/oficinas.module';
import { DepartamentoModule } from './modules/departamento/departamento.module';
import { FormulariosModule } from './modules/formularios/formularios.module';
import { CargosModule } from './modules/cargos/cargos.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    AuthModule,
    ActividadesModule,
    DepartamentoModule,
    EmpleadoCargosModule,
    FormulariosModule,
    OficinasModule,
    SalasModule,
    CargosModule,
    EmpleadoCargosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
