import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDepartamentoDto {
  @IsString()
  @IsOptional()
  facultad: string;

  @IsBoolean()
  esActivo?: boolean;

  @IsString()
  @IsOptional()
  carrera: string;
}
