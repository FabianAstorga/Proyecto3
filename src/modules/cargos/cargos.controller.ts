import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Controller('cargos')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Post()
  create(@Body() dto: CreateCargoDto) {
    return this.cargosService.create(dto);
  }

  @Get()
  findAll() {
    return this.cargosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCargoDto) {
    return this.cargosService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cargosService.remove(+id);
  }
}
