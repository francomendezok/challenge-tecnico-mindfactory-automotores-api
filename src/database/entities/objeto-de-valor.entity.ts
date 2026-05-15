import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Objeto_De_Valor' })
export class ObjetoDeValor {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'ovp_id' })
  ovpId: string;

  @Column({ type: 'varchar', length: 30, default: 'AUTOMOTOR', name: 'ovp_tipo' })
  ovpTipo: string;

  @Column({ type: 'varchar', length: 64, unique: true, name: 'ovp_codigo' })
  ovpCodigo: string;

  @Column({ type: 'varchar', length: 240, nullable: true, name: 'ovp_descripcion' })
  ovpDescripcion: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
