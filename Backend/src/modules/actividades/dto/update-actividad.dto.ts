import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpdateActividadDto {

  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsBoolean()
  @IsOptional()
  esRepetitiva?: boolean;

}
