import { IsNotEmpty, IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class CreateInformeDto {
  @IsNotEmpty()
  @IsString()
  periodo: string;

  @IsNotEmpty()
  @IsInt()
  usuario_id: number;

  @IsOptional()
  @IsEnum(['pendiente', 'enviado', 'revisado', 'aprobado', 'rechazado'])
  estado?: string;
}
