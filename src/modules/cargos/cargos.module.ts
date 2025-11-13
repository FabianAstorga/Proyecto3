import { Module } from '@nestjs/common';
import { CargosService } from './cargos.service';
import { CargosController } from './cargos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from '../../database/entities/cargo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo])],
  controllers: [CargosController],
  providers: [CargosService],
  //exports: [CargosService],
})
export class CargosModule {}
