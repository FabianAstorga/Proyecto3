import { Module } from '@nestjs/common';
import { ActividadService } from './actividades.service';
import { ActividadController } from './actividades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from '../../database/entities/actividad.entity';
import { Usuario } from 'src/database/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad, Usuario])],
  controllers: [ActividadController],
  providers: [ActividadService],
})
export class ActividadesModule {}
