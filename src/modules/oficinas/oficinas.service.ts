import { Injectable } from '@nestjs/common';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';

@Injectable()
export class OficinasService {
  create(createOficinaDto: CreateOficinaDto) {
    return 'This action adds a new oficina';
  }

  findAll() {
    return `This action returns all oficinas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oficina`;
  }

  update(id: number, updateOficinaDto: UpdateOficinaDto) {
    return `This action updates a #${id} oficina`;
  }

  remove(id: number) {
    return `This action removes a #${id} oficina`;
  }
}
