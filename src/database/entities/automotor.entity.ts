import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjetoDeValor } from './objeto-de-valor.entity.js';

@Entity({ name: 'Automotores' })
@Check(`"atr_fecha_fabricacion" BETWEEN 190001 AND 299912`)
export class Automotor {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'atr_id' })
  atrId: string;

  @ManyToOne(() => ObjetoDeValor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'atr_ovp_id', referencedColumnName: 'ovpId' })
  objetoValor: ObjetoDeValor;

  @Column({ type: 'varchar', length: 8, unique: true, name: 'atr_dominio' })
  atrDominio: string;

  @Column({ type: 'varchar', length: 25, nullable: true, name: 'atr_numero_chasis' })
  atrNumeroChasis: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true, name: 'atr_numero_motor' })
  atrNumeroMotor: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true, name: 'atr_color' })
  atrColor: string | null;

  /** YYYYMM */
  @Column({ type: 'int', name: 'atr_fecha_fabricacion' })
  atrFechaFabricacion: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'atr_fecha_alta_registro' })
  atrFechaAltaRegistro: Date;
}
