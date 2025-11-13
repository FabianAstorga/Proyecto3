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

  @IsString()
  @IsOptional()
  estado?: string;

  @IsNumber()
  @IsOptional()
  informe?: number;
}
