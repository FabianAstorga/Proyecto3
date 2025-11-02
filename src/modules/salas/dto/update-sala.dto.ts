import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaDto } from './create-sala.dto';

export class UpdateSalaDto extends PartialType(CreateSalaDto) {}
