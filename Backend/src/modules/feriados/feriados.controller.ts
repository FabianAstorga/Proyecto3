import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FeriadosService } from './feriados.service';
import { CreateFeriadoDto } from './dto/create-feriado.dto';
import { UpdateFeriadoDto } from './dto/update-feriado.dto';
import { QueryFeriadosDto } from './dto/query-feriados.dto';

@Controller('feriados')
export class FeriadosController {
  constructor(private readonly service: FeriadosService) {}

  // GET /feriados?from=2025-12-01&to=2025-12-31&activo=true
  @Get()
  findAll(@Query() query: QueryFeriadosDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFeriadoDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeriadoDto,
  ) {
    return this.service.update(id, dto);
  }

  // recomendado: desactivar en vez de borrar
  @Patch(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDisable(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
