import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ModoCreacion {
  SIMPLE = 'simple',
  FECHAS_ESPECIFICAS = 'fechas_especificas',
  REPETICION_SEMANAL = 'repeticion_semanal',
}

class FechaEspecificaDto {
  @IsDateString()
  fecha: string;
}

export class CreateActividadDto {
  @IsEnum(ModoCreacion)
  @IsNotEmpty()
  modo: ModoCreacion;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsOptional()
  @IsIn(['Pendiente', 'En Progreso', 'Realizada', 'Cancelada'])
  estado?: string;

  @IsBoolean()
  @IsOptional()
  esRepetitiva?: boolean;

  // --- Modo SIMPLE ---
  @IsDateString()
  @IsOptional()
  fecha?: string;

  // --- Modo FECHAS_ESPECIFICAS ---
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FechaEspecificaDto)
  @IsOptional()
  fechas_especificas?: FechaEspecificaDto[];

  // --- Modo REPETICION_SEMANAL ---
  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dias_semana?: string[];
}
