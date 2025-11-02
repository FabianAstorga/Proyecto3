import { Module } from '@nestjs/common';
import { FormulariosService } from './formularios.service';
import { FormulariosController } from './formularios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formulario } from './entities/formulario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Formulario]) 
  ],
  controllers: [FormulariosController],
  providers: [FormulariosService],
})
export class FormulariosModule {}
