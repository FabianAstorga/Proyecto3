import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  rol: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
