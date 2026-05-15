import { Module } from '@nestjs/common';
import { AutomotoresController } from './automotores.controller';
import { AutomotoresService } from './automotores.service';

@Module({
  controllers: [AutomotoresController],
  providers: [AutomotoresService],
})
export class AutomotoresModule {}
