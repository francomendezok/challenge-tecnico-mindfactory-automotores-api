import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Automotor } from '../database/entities/automotor.entity';
import { ObjetoDeValor } from '../database/entities/objeto-de-valor.entity';
import { Sujeto } from '../database/entities/sujeto.entity';
import { VinculoSujetoObjeto } from '../database/entities/vinculo-sujeto-objeto.entity';
import { AutomotoresController } from './automotores.controller';
import { AutomotoresService } from './automotores.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Automotor, ObjetoDeValor, VinculoSujetoObjeto, Sujeto]),
  ],
  controllers: [AutomotoresController],
  providers: [AutomotoresService],
})
export class AutomotoresModule {}
