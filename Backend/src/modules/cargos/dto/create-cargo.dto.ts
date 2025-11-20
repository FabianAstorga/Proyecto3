import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  ocupacion!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsBoolean()
  @IsNotEmpty()
  esActivo!: boolean;
}
