import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { CargosService } from "./cargos.service";
import { CreateCargoDto } from "./dto/create-cargo.dto";
import { UpdateCargoDto } from "./dto/update-cargo.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("charges")
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("administrador")
  create(@Body() dto: CreateCargoDto) {
    return this.cargosService.create(dto);
  }

  @Get("get")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("administrador", "secretaria")
  findAll() {
    return this.cargosService.findAll();
  }

  @Get("get/:id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.cargosService.findOne(id);
  }

  @Patch("update/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("administrador")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCargoDto) {
    return this.cargosService.update(id, dto);
  }

  @Delete("delete/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("administrador")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.cargosService.remove(id);
  }
}
