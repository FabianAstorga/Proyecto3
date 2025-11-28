// src/modules/eventos-globales/eventos-globales.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventoGlobal } from '../../database/entities/evento-global.entity';
import { EventosGlobalesService } from './eventos-globales.service';
import { EventosGlobalesController } from './eventos-globales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventoGlobal])],
  controllers: [EventosGlobalesController],
  providers: [EventosGlobalesService],
  exports: [EventosGlobalesService],
})
export class EventosGlobalesModule {}
