import { IsBoolean, IsIn, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeriadoDto {
  @IsISO8601({ strict: true })
  fecha: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsIn(['nacional', 'regional', 'institucional'])
  tipo: 'nacional' | 'regional' | 'institucional';

  @IsOptional()
  @IsString()
  @MaxLength(10)
  regionCodigo?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
