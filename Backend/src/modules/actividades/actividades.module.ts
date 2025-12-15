import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActividadController } from './actividades.controller';
import { ActividadService } from './actividades.service';

import { Actividad } from 'src/database/entities/actividad.entity';
import { Usuario } from 'src/database/entities/usuario.entity';
import { TipoActividad } from 'src/database/entities/tipo-actividad.entity';

import { InformesModule } from '../informes/informes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Actividad, Usuario, TipoActividad]),
    InformesModule,
  ],
  controllers: [ActividadController],
  providers: [ActividadService],
})
export class ActividadModule {}
