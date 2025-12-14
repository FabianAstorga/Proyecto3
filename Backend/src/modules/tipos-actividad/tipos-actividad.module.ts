import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoActividad } from '../../database/entities/tipo-actividad.entity';
import { TiposActividadController } from './tipos-actividad.controller';
import { TiposActividadService } from './tipos-actividad.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoActividad])],
  controllers: [TiposActividadController],
  providers: [TiposActividadService],
  exports: [TiposActividadService],
})
export class TiposActividadModule {}
