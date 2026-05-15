import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sujeto } from '../database/entities/sujeto.entity';
import { SujetosController } from './sujetos.controller';
import { SujetosService } from './sujetos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sujeto])],
  controllers: [SujetosController],
  providers: [SujetosService],
})
export class SujetosModule {}
