import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadService } from './actividades.service';
import { ActividadController } from './actividades.controller';
import { Actividad } from 'src/database/entities/actividad.entity';
import { Usuario } from 'src/database/entities/usuario.entity';
import { InformesModule } from '../informes/informes.module'; 
@Module({
  imports: [
    TypeOrmModule.forFeature([Actividad, Usuario]),
    InformesModule, 
  ],
  controllers: [ActividadController],
  providers: [ActividadService],
  exports: [ActividadService],
})
export class ActividadModule {}
