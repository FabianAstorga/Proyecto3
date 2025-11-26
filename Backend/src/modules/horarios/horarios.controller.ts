import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';

@UseGuards(JwtAuthGuard)
@Controller('horarios') // <-- EXACTAMENTE 'horarios'
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  // GET /horarios/usuario/4
  @Get('usuario/:id')
  findByUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.findByUsuario(id);
  }

  // PUT /horarios/usuario/4
  @Put('usuario/:id')
  replaceForUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() items: CreateHorarioDto[],
  ) {
    return this.horariosService.replaceForUsuario(id, items);
  }
}
