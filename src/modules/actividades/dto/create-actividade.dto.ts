import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateActividadDto {
  @IsString()
  @IsNotEmpty()
  descripcionAct: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: Date;
  
  @IsString()
  @IsNotEmpty()
  Estado: string; 
  
  @IsString()
  @IsNotEmpty()
  Tipo_Actividad: string;

  // Clave foránea
  @IsNumber()
  @IsNotEmpty()
  formularioId: number;
}
