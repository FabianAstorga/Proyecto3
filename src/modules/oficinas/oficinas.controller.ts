import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OficinasService } from './oficinas.service';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';

@Controller('oficinas')
export class OficinasController {
  constructor(private readonly oficinasService: OficinasService) {}

  @Post()
  create(@Body() createOficinaDto: CreateOficinaDto) {
    return this.oficinasService.create(createOficinaDto);
  }

  @Get()
  findAll() {
    return this.oficinasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.oficinasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOficinaDto: UpdateOficinaDto) {
    return this.oficinasService.update(+id, updateOficinaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oficinasService.remove(+id);
  }
}
