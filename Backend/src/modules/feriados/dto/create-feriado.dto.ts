import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFeriadoDto {
  /** Fecha del feriado (YYYY-MM-DD) */
  @IsDateString()
  fecha: string;

  /** Nombre descriptivo (opcional) */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  /** Tipo de feriado (obligatorio) */
  @IsIn(['nacional', 'regional', 'institucional'])
  tipo: 'nacional' | 'regional' | 'institucional';

  /** Código región (ej: RM, XV). Null/undefined si es nacional */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  regionCodigo?: string;

  /** Permite desactivar sin borrar */
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
