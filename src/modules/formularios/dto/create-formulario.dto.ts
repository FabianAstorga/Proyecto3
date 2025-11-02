import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateFormularioDto {
  @IsString()
  @IsNotEmpty()
  estado_reporte: string; 

  @IsDateString()
  @IsOptional()
  fec_envio?: Date;

  // Clave foránea
  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;
}
