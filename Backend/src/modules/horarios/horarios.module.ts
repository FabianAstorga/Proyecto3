import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Horario } from '../../database/entities/horario.entity';
import { Usuario } from '../../database/entities/usuario.entity';

import { HorariosController } from './horarios.controller';
import { HorariosService } from './horarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Horario, Usuario])],
  controllers: [HorariosController],
  providers: [HorariosService],
})
export class HorariosModule {}
