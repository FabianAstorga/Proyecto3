import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateEmpleadoCargoDto {
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: Date;

  @IsDateString()
  @IsOptional()
  fecha_fin?: Date;

  // Claves foráneas
  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;

  @IsNumber()
  @IsNotEmpty()
  cargoId: number;
}
