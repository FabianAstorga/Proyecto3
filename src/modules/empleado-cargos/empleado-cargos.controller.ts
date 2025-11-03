import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoCargosService } from './empleado-cargos.service';
import { CreateEmpleadoCargoDto } from './dto/create-empleado-cargo.dto';
import { UpdateEmpleadoCargoDto } from './dto/update-empleado-cargo.dto';

@Controller('empleado-cargos')
export class EmpleadoCargosController {
  constructor(private readonly empleadoCargosService: EmpleadoCargosService) {}

  @Post()
  create(@Body() createEmpleadoCargoDto: CreateEmpleadoCargoDto) {
    return this.empleadoCargosService.create(createEmpleadoCargoDto);
  }

  @Get()
  findAll() {
    return this.empleadoCargosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadoCargosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoCargoDto: UpdateEmpleadoCargoDto) {
    return this.empleadoCargosService.update(+id, updateEmpleadoCargoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoCargosService.remove(+id);
  }
}
