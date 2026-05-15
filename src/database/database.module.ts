import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Automotor,
  ObjetoDeValor,
  Sujeto,
  VinculoSujetoObjeto,
} from './entities/index.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'postgres',
      database: process.env.DATABASE_NAME ?? 'automotores',
      entities: [Sujeto, ObjetoDeValor, Automotor, VinculoSujetoObjeto],
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      logging:
        process.env.TYPEORM_LOGGING === 'true' ? ['query', 'schema', 'error'] : ['error'],
    }),
  ],
})
export class DatabaseModule {}
