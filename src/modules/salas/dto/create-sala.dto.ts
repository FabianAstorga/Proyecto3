import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsNumber()
  @IsOptional()
  capacidadMax?: number;

  @IsString()
  @IsOptional()
  url_mapa?: string;

  @IsString()
  @IsOptional()
  QR?: string;

  // Clave foránea
  @IsNumber()
  @IsNotEmpty()
  departamentoId: number;
}
