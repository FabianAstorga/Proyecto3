import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoActividadDto } from './create-tipo-actividad.dto';

export class UpdateTipoActividadDto extends PartialType(CreateTipoActividadDto) {}
