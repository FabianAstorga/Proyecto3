import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from "@nestjs/common";
import { CreateEmpleadoCargoDto } from "./dto/create-empleado-cargo.dto";
import { UpdateEmpleadoCargoDto } from "./dto/update-empleado-cargo.dto";
import { EmpleadoCargoService } from "./empleado-cargos.service";

@Controller("employee-charge")
export class EmpleadoCargoController {
  constructor(private readonly service: EmpleadoCargoService) {}

  @Post("create")
  create(@Body() dto: CreateEmpleadoCargoDto) {
    return this.service.create(dto);
  }

  @Get("get")
  findAll() {
    return this.service.findAll();
  }

  @Get("get/:id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(+id);
  }

  @Put("update/:id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoCargoDto
  ) {
    return this.service.update(+id, dto);
  }

  @Delete("delete/:id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(+id);
  }
}
