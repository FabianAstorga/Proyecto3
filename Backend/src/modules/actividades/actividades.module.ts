import { Module } from '@nestjs/common';
import { ActividadService } from './actividades.service';
import { ActividadesController } from './actividades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from '../../database/entities/actividad.entity';
import { InformesModule } from '../informes/informes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad]),
  InformesModule],
  controllers: [ActividadesController],
  providers: [ActividadService],
})
export class ActividadesModule {}
