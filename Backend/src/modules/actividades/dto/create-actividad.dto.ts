import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsDateString, 
  IsArray, 
  ValidateNested,
  IsBoolean,
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ModoCreacion {
  SIMPLE = 'simple',
  FECHAS_ESPECIFICAS = 'fechas_especificas',
  REPETICION_SEMANAL = 'repeticion_semanal'
}

export class FechaEspecificaDto {
  @IsDateString()
  fecha: string;
}

export class CreateActividadDto {
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @IsString()
  titulo: string;

  @IsNotEmpty({ message: 'El tipo de actividad es obligatorio.' })
  @IsString()
  tipo: string;

  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  @IsEnum(['Pendiente', 'En Progreso', 'Realizada', 'Cancelada'])
  estado: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @IsString()
  descripcion: string;

  // No se envía informe_id, se calcula automáticamente
  // El usuario_id se obtiene del token JWT

  @IsOptional()
  @IsBoolean()
  esRepetitiva?: boolean;

  @IsNotEmpty({ message: 'El modo de creación es obligatorio.' })
  @IsEnum(ModoCreacion)
  modo: ModoCreacion;

  // Modo simple
  @IsOptional()
  @IsDateString()
  fecha?: string;

  // Modo fechas específicas
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FechaEspecificaDto)
  fechas_especificas?: FechaEspecificaDto[];

  // Modo repetición semanal
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @IsOptional()
  @IsArray()
  dias_semana?: string[];
}
