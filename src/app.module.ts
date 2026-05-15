import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AutomotoresModule } from './automotores/automotores.module';
import { HealthModule } from './health/health.module';
import { SujetosModule } from './sujetos/sujetos.module';

@Module({
  imports: [DatabaseModule, HealthModule, AutomotoresModule, SujetosModule],
})
export class AppModule {}
