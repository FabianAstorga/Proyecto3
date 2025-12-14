import { PartialType } from '@nestjs/mapped-types';
import { CreateFeriadoDto } from './create-feriado.dto';

export class UpdateFeriadoDto extends PartialType(CreateFeriadoDto) {}
