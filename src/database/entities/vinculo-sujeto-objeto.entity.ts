import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjetoDeValor } from './objeto-de-valor.entity.js';
import { Sujeto } from './sujeto.entity.js';

@Entity({ name: 'Vinculo_Sujeto_Objeto' })
@Index('uq_vso_owner_actual', ['objetoValor'], {
  unique: true,
  where:
    `"vso_responsable" = 'S' AND "vso_fecha_fin" IS NULL AND "vso_tipo_vinculo" = 'DUENO'`,
})
export class VinculoSujetoObjeto {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'vso_id' })
  vsoId: string;

  @ManyToOne(() => ObjetoDeValor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vso_ovp_id', referencedColumnName: 'ovpId' })
  objetoValor: ObjetoDeValor;

  @ManyToOne(() => Sujeto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vso_spo_id', referencedColumnName: 'spoId' })
  sujeto: Sujeto;

  @Column({ type: 'varchar', length: 30, default: 'DUENO', name: 'vso_tipo_vinculo' })
  vsoTipoVinculo: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 100,
    name: 'vso_porcentaje',
  })
  vsoPorcentaje: string;

  @Column({ type: 'char', length: 1, default: 'S', name: 'vso_responsable' })
  vsoResponsable: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE', name: 'vso_fecha_inicio' })
  vsoFechaInicio: Date;

  @Column({ type: 'date', nullable: true, name: 'vso_fecha_fin' })
  vsoFechaFin: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
