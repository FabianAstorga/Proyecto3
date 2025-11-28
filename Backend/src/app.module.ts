import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "./config/config.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ActividadModule } from "./modules/actividades/actividades.module";
import { EmpleadoCargosModule } from "./modules/empleado-cargos/empleado-cargos.module";
import { CargosModule } from "./modules/cargos/cargos.module";
import { UsuariosModule } from "./modules/usuarios/usuarios.module";
import { InformesModule } from './modules/informes/informes.module';
import { HorariosModule } from "./modules/horarios/horarios.module";
import { EventosGlobalesModule } from './modules/eventos-globales/eventos-globales.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    AuthModule,
    ActividadModule,
    EmpleadoCargosModule,
    CargosModule,
    UsuariosModule,
    InformesModule,
    HorariosModule,
    EventosGlobalesModule
    // InformesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
