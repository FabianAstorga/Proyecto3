import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Controller('actividad')
export class ActividadController {
  constructor(private readonly actividadService: ActividadesService) {}

  @Post()
  create(@Body() dto: CreateActividadDto) {
    return this.actividadService.create(dto);
  }

  @Get()
  findAll() {
    return this.actividadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.actividadService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateActividadDto) {
    return this.actividadService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.actividadService.remove(id);
  }
}
