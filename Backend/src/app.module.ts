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
import { InformesModule } from "./modules/informes/informes.module";
import { HorariosModule } from "./modules/horarios/horarios.module";
import { EventosGlobalesModule } from "./modules/eventos-globales/eventos-globales.module";
import { FeriadosModule } from "./modules/feriados/feriados.module";
import { TiposActividadModule } from "./modules/tipos-actividad/tipos-actividad.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path"; // path es crucial, lo importamos de node

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // 1. Ruta FÍSICA de la carpeta que contiene las fotos.
      // Si multer guarda en './uploads/users', la ruta base que necesitamos servir es './uploads'.
      rootPath: join(__dirname, "..", "uploads"),

      // 2. Ruta URL VIRTUAL: Si la petición en Angular es http://localhost:3000/uploads/...,
      // entonces 'serveRoot' debe ser '/uploads'.
      serveRoot: "/uploads",
    }),
    DatabaseModule,
    ConfigModule,
    AuthModule,
    ActividadModule,
    EmpleadoCargosModule,
    CargosModule,
    UsuariosModule,
    InformesModule,
    HorariosModule,
    EventosGlobalesModule,
    FeriadosModule,
    TiposActividadModule,
    // InformesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
