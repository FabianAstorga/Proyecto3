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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // SOLO administrador puede crear usuarios
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // SOLO administrador puede ver todos
  @Get('getAll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  findAll() {
    return this.usuariosService.findAll();
  }

  // Obtener mi perfil usando mi token
  @Get('getProfile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.usuariosService.findOne(user.id);
  }

  // Actualizar MIS datos (sin permitir editar otro usuario)
  @Patch('updateProfile')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(
    @Req() req: Request,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const user = req.user as any;
    return this.usuariosService.update(user.id, updateUsuarioDto);
  }

  // SOLO administrador puede actualizar cualquier usuario
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  // SOLO administrador puede eliminar
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
