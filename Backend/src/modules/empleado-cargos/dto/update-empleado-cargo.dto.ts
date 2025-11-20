import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoCargoDto } from './create-empleado-cargo.dto';

export class UpdateEmpleadoCargoDto extends PartialType(CreateEmpleadoCargoDto) {}
