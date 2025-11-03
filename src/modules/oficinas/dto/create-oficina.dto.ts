import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOficinaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  url_mapa?: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;
}
