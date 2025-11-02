import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';

@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post()
  create(@Body() createActividadeDto: CreateActividadDto) {
    return this.actividadesService.create(createActividadeDto);
  }

  @Get()
  findAll() {
    return this.actividadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActividadeDto: UpdateActividadeDto) {
    return this.actividadesService.update(+id, updateActividadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(+id);
  }
}
