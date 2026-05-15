import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import {
  isValidCuit,
  isValidDominio,
  isValidFechaFabricacion,
  normalizeCuit,
  normalizeDominio,
} from '../common/validators';
import { Automotor } from '../database/entities/automotor.entity';
import { ObjetoDeValor } from '../database/entities/objeto-de-valor.entity';
import { Sujeto } from '../database/entities/sujeto.entity';
import { VinculoSujetoObjeto } from '../database/entities/vinculo-sujeto-objeto.entity';
import { CreateAutomotorDto } from './dto/create-automotor.dto';
import { UpdateAutomotorDto } from './dto/update-automotor.dto';

@Injectable()
export class AutomotoresService {
  constructor(
    @InjectRepository(Automotor)
    private readonly automotorRepo: Repository<Automotor>,
    @InjectRepository(ObjetoDeValor)
    private readonly objetoRepo: Repository<ObjetoDeValor>,
    @InjectRepository(VinculoSujetoObjeto)
    private readonly vinculoRepo: Repository<VinculoSujetoObjeto>,
    @InjectRepository(Sujeto)
    private readonly sujetoRepo: Repository<Sujeto>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const autos = await this.automotorRepo.find({
      relations: ['objetoValor'],
      order: { atrDominio: 'ASC' },
    });
    const out: Array<{
      dominio: string;
      numeroChasis: string | null;
      numeroMotor: string | null;
      color: string | null;
      fechaFabricacion: number;
      fechaAltaRegistro: Date;
      duenoActual: { cuit: string; denominacion: string } | null;
    }> = [];
    for (const a of autos) {
      const v = await this.findActiveOwner(a.objetoValor.ovpId);
      out.push(this.mapAutomotor(a, v));
    }
    return out;
  }

  async findByDominio(dominioRaw: string) {
    const a = await this.findAutomotorByDominio(dominioRaw);
    if (!a) {
      throw new NotFoundException('No se encontró un automotor con ese dominio');
    }
    const v = await this.findActiveOwner(a.objetoValor.ovpId);
    return this.mapAutomotor(a, v);
  }

  async create(dto: CreateAutomotorDto) {
    this.assertAutomotorPayload(dto.dominio, dto.cuit, dto.fechaFabricacion);

    const dominio = normalizeDominio(dto.dominio);
    const cuit = normalizeCuit(dto.cuit);

    if (await this.findAutomotorByDominio(dominio)) {
      throw new UnprocessableEntityException('Ya existe un automotor con ese dominio');
    }

    const sujeto = await this.sujetoRepo.findOne({ where: { spoCuit: cuit } });
    if (!sujeto) {
      throw new UnprocessableEntityException(
        'No existe un sujeto con el CUIT indicado; creá el sujeto con POST /api/sujetos',
      );
    }

    await this.dataSource.transaction(async (em) => {
      const ovpRepo = em.getRepository(ObjetoDeValor);
      const autoRepo = em.getRepository(Automotor);
      const vRepo = em.getRepository(VinculoSujetoObjeto);

      const ov = ovpRepo.create({
        ovpTipo: 'AUTOMOTOR',
        ovpCodigo: dominio,
        ovpDescripcion: null,
      });
      await ovpRepo.save(ov);

      const auto = autoRepo.create({
        objetoValor: ov,
        atrDominio: dominio,
        atrNumeroChasis: dto.numeroChasis?.trim() ?? null,
        atrNumeroMotor: dto.numeroMotor?.trim() ?? null,
        atrColor: dto.color?.trim() ?? null,
        atrFechaFabricacion: dto.fechaFabricacion,
      });
      await autoRepo.save(auto);

      const v = vRepo.create({
        objetoValor: ov,
        sujeto: { spoId: sujeto.spoId } as Sujeto,
        vsoTipoVinculo: 'DUENO',
        vsoPorcentaje: '100.00',
        vsoResponsable: 'S',
        vsoFechaFin: null,
      });
      await vRepo.save(v);
    });

    const created = await this.findAutomotorByDominio(dominio);
    const vinculo = await this.findActiveOwner(created!.objetoValor.ovpId);
    return this.mapAutomotor(created!, vinculo);
  }

  async update(dominioRaw: string, dto: UpdateAutomotorDto) {
    const auto = await this.findAutomotorByDominio(dominioRaw);
    if (!auto) {
      throw new NotFoundException('No se encontró un automotor con ese dominio');
    }

    if (dto.fechaFabricacion !== undefined) {
      if (!isValidFechaFabricacion(dto.fechaFabricacion)) {
        throw new UnprocessableEntityException(
          'La fecha de fabricación debe ser YYYYMM, con mes válido y no posterior al período actual',
        );
      }
      auto.atrFechaFabricacion = dto.fechaFabricacion;
    }
    if (dto.numeroChasis !== undefined) {
      auto.atrNumeroChasis = dto.numeroChasis?.trim() ?? null;
    }
    if (dto.numeroMotor !== undefined) {
      auto.atrNumeroMotor = dto.numeroMotor?.trim() ?? null;
    }
    if (dto.color !== undefined) {
      auto.atrColor = dto.color?.trim() ?? null;
    }

    if (dto.cuit !== undefined) {
      if (!isValidCuit(dto.cuit)) {
        throw new UnprocessableEntityException('CUIT inválido');
      }
      const cuitNuevo = normalizeCuit(dto.cuit);
      const sujetoNuevo = await this.sujetoRepo.findOne({ where: { spoCuit: cuitNuevo } });
      if (!sujetoNuevo) {
        throw new UnprocessableEntityException('No existe un sujeto con el CUIT indicado');
      }

      const actual = await this.findActiveOwner(auto.objetoValor.ovpId);
      const cuitActual = actual?.sujeto?.spoCuit;

      if (cuitActual !== cuitNuevo) {
        await this.dataSource.transaction(async (em) => {
          const vRepo = em.getRepository(VinculoSujetoObjeto);
          await this.closeActiveOwnerInTx(em, auto.objetoValor.ovpId);
          const ovpRepo = em.getRepository(ObjetoDeValor);
          const ov = await ovpRepo.findOneOrFail({
            where: { ovpId: auto.objetoValor.ovpId },
          });
          const v = vRepo.create({
            objetoValor: ov,
            sujeto: { spoId: sujetoNuevo.spoId } as Sujeto,
            vsoTipoVinculo: 'DUENO',
            vsoPorcentaje: '100.00',
            vsoResponsable: 'S',
            vsoFechaFin: null,
          });
          await vRepo.save(v);
        });
      }
    }

    await this.automotorRepo.save(auto);

    const refreshed = await this.findAutomotorByDominio(auto.atrDominio);
    const vinculo = await this.findActiveOwner(refreshed!.objetoValor.ovpId);
    return this.mapAutomotor(refreshed!, vinculo);
  }

  async remove(dominioRaw: string): Promise<void> {
    const auto = await this.findAutomotorByDominio(dominioRaw);
    if (!auto) {
      throw new NotFoundException('No se encontró un automotor con ese dominio');
    }
    await this.objetoRepo.delete({ ovpId: auto.objetoValor.ovpId });
  }

  private assertAutomotorPayload(dominio: string, cuit: string, fecha: number) {
    if (!isValidDominio(dominio)) {
      throw new UnprocessableEntityException(
        'Dominio inválido: debe ser formato AAA999 o AA999AA (Mercosur)',
      );
    }
    if (!isValidCuit(cuit)) {
      throw new UnprocessableEntityException('CUIT inválido');
    }
    if (!isValidFechaFabricacion(fecha)) {
      throw new UnprocessableEntityException(
        'La fecha de fabricación debe ser YYYYMM, con mes válido y no posterior al período actual',
      );
    }
  }

  private async findAutomotorByDominio(dominioRaw: string) {
    const d = normalizeDominio(dominioRaw);
    return this.automotorRepo.findOne({
      where: { atrDominio: d },
      relations: ['objetoValor'],
    });
  }

  private async findActiveOwner(ovpId: string) {
    return this.vinculoRepo.findOne({
      where: {
        objetoValor: { ovpId },
        vsoResponsable: 'S',
        vsoFechaFin: IsNull(),
        vsoTipoVinculo: 'DUENO',
      },
      relations: ['sujeto'],
    });
  }

  private async closeActiveOwnerInTx(em: EntityManager, ovpId: string) {
    const vRepo = em.getRepository(VinculoSujetoObjeto);
    const active = await vRepo.findOne({
      where: {
        objetoValor: { ovpId },
        vsoResponsable: 'S',
        vsoFechaFin: IsNull(),
        vsoTipoVinculo: 'DUENO',
      },
    });
    if (active) {
      active.vsoFechaFin = new Date();
      await vRepo.save(active);
    }
  }

  private mapAutomotor(a: Automotor, vinculo: VinculoSujetoObjeto | null) {
    return {
      dominio: a.atrDominio,
      numeroChasis: a.atrNumeroChasis,
      numeroMotor: a.atrNumeroMotor,
      color: a.atrColor,
      fechaFabricacion: a.atrFechaFabricacion,
      fechaAltaRegistro: a.atrFechaAltaRegistro,
      duenoActual: vinculo
        ? {
            cuit: vinculo.sujeto.spoCuit,
            denominacion: vinculo.sujeto.spoDenominacion,
          }
        : null,
    };
  }
}
