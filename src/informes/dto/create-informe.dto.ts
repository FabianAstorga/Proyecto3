// En: src/modules/informes/dto/create-informe.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateInformeDto {
  @IsString()
  @IsNotEmpty()
  periodo: string; // ej: "2025-11"

  @IsString()
  @IsNotEmpty()
  url_pdf: string;

  @IsDateString()
  @IsOptional()
  fechaEnvio?: Date;

  @IsDateString()
  @IsOptional()
  fechaRevision?: Date;

  @IsString()
  @IsOptional()
  estado?: string; 

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsNumber()
  @IsNotEmpty()
  usuarioId: number; 
}

