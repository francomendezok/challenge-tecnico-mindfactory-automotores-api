import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Sujeto' })
export class Sujeto {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'spo_id' })
  spoId: string;

  @Column({ type: 'varchar', length: 11, unique: true, name: 'spo_cuit' })
  spoCuit: string;

  @Column({ type: 'varchar', length: 160, name: 'spo_denominacion' })
  spoDenominacion: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
