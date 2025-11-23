// update-empleado-cargo.dto.ts
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";

export class UpdateEmpleadoCargoDto {
  @IsNumber()
  @IsOptional()
  id_usuario?: number;

  @IsNumber()
  @IsOptional()
  id_cargo?: number;
}
