import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateEmpleadoCargoDto } from './dto/create-empleado-cargo.dto';
import { UpdateEmpleadoCargoDto } from './dto/update-empleado-cargo.dto';
import { EmpleadoCargoService } from './empleado-cargos.service';

@Controller('empleado-cargo')
export class EmpleadoCargoController {
  constructor(private readonly service: EmpleadoCargoService) {}

  @Post()
  create(@Body() dto: CreateEmpleadoCargoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpleadoCargoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
