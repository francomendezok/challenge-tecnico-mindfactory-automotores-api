import { DataSource } from 'typeorm';

export async function truncateAllPublicTables(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    TRUNCATE TABLE "Vinculo_Sujeto_Objeto", "Automotores", "Objeto_De_Valor", "Sujeto"
    RESTART IDENTITY CASCADE;
  `);
}
