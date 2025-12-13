import { Module } from '@nestjs/common';
import { TiposActividadController } from './tipos-actividad.controller';
import { TiposActividadService } from './tipos-actividad.service';

@Module({
  controllers: [TiposActividadController],
  providers: [TiposActividadService]
})
export class TiposActividadModule {}
