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
  ParseIntPipe,
  Put,
} from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { userMulterConfig } from "./multer.config";

@Controller("users")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // SOLO administrador puede crear usuarios
  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("administrador")
  @UseInterceptors(FileInterceptor("photo", userMulterConfig))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUsuarioDto: CreateUsuarioDto
  ) {
    if (file) {
      createUsuarioDto.foto_url = `/uploads/users/${file.filename}`;
    } else {
      createUsuarioDto.foto_url ??= "/usuario(1).png";
    }

    return this.usuariosService.create(createUsuarioDto);
  }

  // SOLO administrador puede ver todos
  @Get("get")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("administrador", "secretaria", "funcionario")
  findAll() {
    return this.usuariosService.findAll();
  }

  // Obtener mi perfil usando mi token
  @Get("get/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Get("getProfile")
  @UseGuards(JwtAuthGuard)
  findProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.usuariosService.findOne(user.id);
  }

  // Actualizar MIS datos (sin permitir editar otro usuario)
  @Patch("updateProfile")
  @UseGuards(JwtAuthGuard)
  updateMyProfile(
    @Req() req: Request,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    const user = req.user as any;
    return this.usuariosService.update(user.id, updateUsuarioDto);
  }

  // SOLO administrador puede actualizar cualquier usuario
  @Patch("update/:id")
  @UseInterceptors(FileInterceptor("photo", userMulterConfig))
  update(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateUsuarioDto
  ) {
    // 📸 Nueva foto
    if (file) {
      dto.foto_url = `/uploads/users/${file.filename}`;
    }

    // ❌ Quitar foto
    if ((dto as any).removePhoto === "true") {
      dto.foto_url = "/usuario(1).png";
    }

    return this.usuariosService.update(id, dto);
  }

  // SOLO administrador puede eliminar
  @Delete("delete/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("administrador")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
