import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
  
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
