import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoCargo } from 'src/database/entities/empleado-cargo.entity';
import { EmpleadoCargoController } from './empleado-cargos.controller';
import { EmpleadoCargoService } from './empleado-cargos.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmpleadoCargo])],
  controllers: [EmpleadoCargoController],
  providers: [EmpleadoCargoService],
})
export class EmpleadoCargosModule {}

