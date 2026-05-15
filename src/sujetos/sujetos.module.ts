import { Module } from '@nestjs/common';
import { SujetosController } from './sujetos.controller';
import { SujetosService } from './sujetos.service';

@Module({
  controllers: [SujetosController],
  providers: [SujetosService],
})
export class SujetosModule {}
