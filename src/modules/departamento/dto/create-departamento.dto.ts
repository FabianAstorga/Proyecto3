import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @IsOptional()
  facultad?: string;

  @IsString()
  @IsOptional()
  carrera?: string;

  @IsBoolean()
  @IsOptional()
  esActivo?: boolean;
}
