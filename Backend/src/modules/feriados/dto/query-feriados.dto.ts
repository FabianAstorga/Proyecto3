import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class QueryFeriadosDto {
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string; // YYYY-MM-DD

  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  regionCodigo?: string; // ej: 'RM'

  @IsOptional()
  @IsString()
  tipo?: 'nacional' | 'regional' | 'institucional'; // filtro opcional

  @IsOptional()
  @IsString()
  activo?: 'true' | 'false'; // viene como string desde query
}
