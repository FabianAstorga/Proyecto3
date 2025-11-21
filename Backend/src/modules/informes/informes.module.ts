import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformesService } from './informes.service';
import { InformesController } from './informes.controller';
import { Informe } from 'src/database/entities/informe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Informe]), 
  ],
  controllers: [InformesController],
  providers: [InformesService],
  exports: [InformesService], 
})
export class InformesModule {}
