import { Module } from '@nestjs/common';
import { OficinasService } from './oficinas.service';
import { OficinasController } from './oficinas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oficina } from './entities/oficina.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Oficina]) 
  ],
  controllers: [OficinasController],
  providers: [OficinasService],
})
export class OficinasModule {}
