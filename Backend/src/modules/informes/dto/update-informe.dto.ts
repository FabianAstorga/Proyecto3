import { PartialType } from '@nestjs/mapped-types';
import { CreateInformeDto } from './create-informe.dto';
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class UpdateInformeDto extends PartialType(CreateInformeDto) {
  @IsOptional()
  @IsDateString()
  fechaEnvio?: string;

  @IsOptional()
  @IsDateString()
  fechaRevision?: string;

  @IsOptional()
  @IsEnum(['pendiente', 'enviado', 'revisado', 'aprobado', 'rechazado'])
  estado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}