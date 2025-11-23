import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ActividadService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('actividades')
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateActividadDto, @Req() req: Request) {
    const user = req.user as any; // viene del JwtStrategy (user.id, user.rol, etc.)
    return this.actividadService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.actividadService.findAll();
  }
  
  @Get('usuario/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(@Param('userId') userId: string) {
    return this.actividadService.findByUser(Number(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.actividadService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateActividadDto) {
    return this.actividadService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.actividadService.remove(Number(id));
  }
}
