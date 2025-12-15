import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryFeriadosDto {
  @IsOptional()
  @IsDateString()
  from?: string; // YYYY-MM-DD

  @IsOptional()
  @IsDateString()
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
