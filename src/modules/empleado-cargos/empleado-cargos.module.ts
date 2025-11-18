import { Module } from '@nestjs/common';
import { EmpleadoCargoService } from './empleado-cargos.service';
import { EmpleadoCargoController } from './empleado-cargos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoCargo } from 'src/database/entities/empleado-cargo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmpleadoCargo])],
  controllers: [EmpleadoCargoController],
  providers: [EmpleadoCargoService],
})
export class EmpleadoCargosModule {}
