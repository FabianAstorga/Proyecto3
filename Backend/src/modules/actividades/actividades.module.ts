import { Module } from '@nestjs/common';
import { ActividadService } from './actividades.service';
import { ActividadController } from './actividades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from '../../database/entities/actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad])],
  controllers: [ActividadController],
  providers: [ActividadService],
})
export class ActividadesModule {}
