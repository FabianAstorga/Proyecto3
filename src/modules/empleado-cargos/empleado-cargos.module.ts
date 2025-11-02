import { Module } from '@nestjs/common';
import { EmpleadoCargosService } from './empleado-cargos.service';
import { EmpleadoCargosController } from './empleado-cargos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoCargo } from './entities/empleado-cargo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmpleadoCargo]) 
  ],
  controllers: [EmpleadoCargosController],
  providers: [EmpleadoCargosService],
})
export class EmpleadoCargosModule {}
