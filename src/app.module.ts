import { Module } from '@nestjs/common';
import { AutomotoresModule } from './automotores/automotores.module';
import { SujetosModule } from './sujetos/sujetos.module';

@Module({
  imports: [AutomotoresModule, SujetosModule],
})
export class AppModule {}
