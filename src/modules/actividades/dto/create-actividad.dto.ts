import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateActividadDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsDateString()
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsBoolean()
  @IsOptional()
  es_repetitiva?: boolean;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsNumber()
  @IsNotEmpty()
  id_informe: number; 
}

