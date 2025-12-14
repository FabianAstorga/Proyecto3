import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { TiposActividadService } from './tipos-actividad.service';
import { CreateTipoActividadDto } from './dto/create-tipo-actividad.dto';
import { UpdateTipoActividadDto } from './dto/update-tipo-actividad.dto';
import { QueryTiposActividadDto } from './dto/query-tipos-actividad.dto';

@Controller('tipos-actividad')
export class TiposActividadController {
  constructor(private readonly service: TiposActividadService) {}

  // GET /tipos-actividad?activo=true
  @Get()
  findAll(@Query() query: QueryTiposActividadDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTipoActividadDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoActividadDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.service.disable(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
