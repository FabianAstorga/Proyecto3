// src/modules/eventos-globales/dto/global-event.dto.ts
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie';

export class GlobalEventDto {
  @IsIn(['lun', 'mar', 'mie', 'jue', 'vie'])
  dayKey: DayKey;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  blockCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}
