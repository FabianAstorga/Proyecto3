import { IsOptional, IsString } from 'class-validator';

export class QueryTiposActividadDto {
  @IsOptional()
  @IsString()
  activo?: 'true' | 'false';
}
