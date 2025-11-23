import { Controller, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { InformesService } from './informes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('informes')
@UseGuards(JwtAuthGuard)
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Get('mis-informes')
  findMisInformes(@Req() req: Request) {
    const user = req.user as any;
    return this.informesService.findByUsuario(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.informesService.findOne(Number(id));
  }

  @Patch(':id/enviar')
  marcarComoEnviado(@Param('id') id: number) {
    return this.informesService.marcarComoEnviado(Number(id));
  }
}