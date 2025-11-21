import { 
  Controller, 
  Get, 
  Param, 
  Patch, 
  UseGuards,
  Request
} from '@nestjs/common';
import { InformesService } from './informes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('informes')
@UseGuards(JwtAuthGuard)
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  // Obtener todos los informes del usuario autenticado
  @Get('mis-informes')
  findMisInformes(@Request() req) {
    const usuarioId = req.user.sub;
    return this.informesService.findByUsuario(usuarioId);
  }

  // Obtener informes de un usuario específico (para admin/secretaria)
  @Get('usuario/:usuarioId')
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.informesService.findByUsuario(+usuarioId);
  }

  // Obtener un informe específico con sus actividades
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informesService.findOne(+id);
  }

  // Marcar informe como enviado
  @Patch(':id/enviar')
  marcarComoEnviado(@Param('id') id: string) {
    return this.informesService.marcarComoEnviado(+id);
  }
}