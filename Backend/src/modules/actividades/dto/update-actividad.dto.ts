import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsIn,
  IsInt,
  Min,
} from "class-validator";

export class UpdateActividadDto {
  // ❌ QUITADO: titulo

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  tipo_actividad_id?: number;

  @IsString()
  @IsOptional()
  tipoActividadDetalle?: string;

  @IsString()
  @IsOptional()
  @IsIn(["Pendiente", "En Progreso", "Realizada", "Cancelada"])
  estado?: string;

  @IsBoolean()
  @IsOptional()
  esRepetitiva?: boolean;
}
