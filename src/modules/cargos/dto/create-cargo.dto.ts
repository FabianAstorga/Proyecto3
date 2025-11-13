import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  ocupacion: string;

  @IsString()
  @IsOptional()
  descripcion: string;
}
