import { Module } from '@nestjs/common';
import { ActividadService } from './actividades.service';
import { ActividadController } from './actividades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from '../../database/entities/actividad.entity';
import { Usuario } from 'src/database/entities/usuario.entity';
import { InformesModule } from '../informes/informes.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Actividad, Usuario]),
    InformesModule, 
  ],
  controllers: [ActividadController],
  providers: [ActividadService],
})
export class ActividadesModule {}