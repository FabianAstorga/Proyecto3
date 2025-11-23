import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsIn,
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

  @IsString()
  @IsOptional()
  @IsIn(['Pendiente', 'En Progreso', 'Realizada', 'Cancelada'])
  estado?: string;

  @IsBoolean()
  @IsOptional()
  esRepetitiva?: boolean;

}