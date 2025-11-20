import { IsString, IsOptional } from 'class-validator';

export class UpdateCargoDto {
  @IsOptional()
  @IsString()
  ocupacion: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
