import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformesService } from './informes.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Post()
  create(@Body() createInformeDto: CreateInformeDto) {
    return this.informesService.create(createInformeDto);
  }

  @Get()
  findAll() {
    return this.informesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeDto: UpdateInformeDto) {
    return this.informesService.update(+id, updateInformeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informesService.remove(+id);
  }
}
