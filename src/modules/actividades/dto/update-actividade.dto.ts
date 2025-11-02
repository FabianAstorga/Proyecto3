import { PartialType } from '@nestjs/mapped-types';
import { CreateActividadDto } from './create-actividade.dto';

export class UpdateActividadeDto extends PartialType(CreateActividadDto) {}
