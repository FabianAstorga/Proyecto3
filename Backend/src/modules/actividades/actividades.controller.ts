import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ActividadService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('actividades')
@UseGuards(JwtAuthGuard)
export class ActividadesController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post()
  create(@Body() createActividadDto: CreateActividadDto, @Request() req) {
    const usuarioId = req.user.id; // Viene del JwtStrategy
    return this.actividadService.create(createActividadDto, usuarioId);
  }

  @Get()
  findAll() {
    return this.actividadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActividadDto: UpdateActividadDto) {
    return this.actividadService.update(+id, updateActividadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadService.remove(+id);
  }
}
