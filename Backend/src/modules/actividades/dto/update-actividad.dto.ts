import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsEnum,
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

  @IsOptional()
  @IsEnum(['Pendiente', 'En Progreso', 'Realizada', 'Cancelada'])
  estado?: string;

  @IsBoolean()
  @IsOptional()
  esRepetitiva?: boolean;

}
