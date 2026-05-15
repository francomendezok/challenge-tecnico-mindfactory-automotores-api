import { config } from 'dotenv';
import { resolve } from 'node:path';

/**
 * Debe importarse antes de `AppModule` para que TypeORM lea DATABASE_* del `.env`.
 */
config({ path: resolve(process.cwd(), '.env') });
