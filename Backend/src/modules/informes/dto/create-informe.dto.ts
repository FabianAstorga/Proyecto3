import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateInformeDto {
  @IsNotEmpty()
  @IsString()
  periodo: string;

  @IsOptional()
  @IsEnum(['pendiente', 'enviado', 'revisado', 'aprobado', 'rechazado'])
  estado?: string;
}