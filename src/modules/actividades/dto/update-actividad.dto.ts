import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpdateActividadDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha?: Date;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsBoolean()
  @IsOptional()
  es_repetitiva?: boolean;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsNumber()
  @IsOptional()
  informe_id?: number;
}
