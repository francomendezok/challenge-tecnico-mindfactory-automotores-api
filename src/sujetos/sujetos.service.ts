import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isValidCuit, normalizeCuit } from '../common/validators';
import { Sujeto } from '../database/entities/sujeto.entity';
import { CreateSujetoDto } from './dto/create-sujeto.dto';

@Injectable()
export class SujetosService {
  constructor(
    @InjectRepository(Sujeto)
    private readonly sujetoRepo: Repository<Sujeto>,
  ) {}

  async findByCuit(cuitRaw: string) {
    if (!isValidCuit(cuitRaw)) {
      throw new UnprocessableEntityException('CUIT inválido');
    }
    const cuit = normalizeCuit(cuitRaw);
    const s = await this.sujetoRepo.findOne({ where: { spoCuit: cuit } });
    if (!s) {
      throw new NotFoundException('No se encontró un sujeto con ese CUIT');
    }
    return this.toResponse(s);
  }

  async create(dto: CreateSujetoDto) {
    if (!isValidCuit(dto.cuit)) {
      throw new UnprocessableEntityException('CUIT inválido');
    }
    const cuit = normalizeCuit(dto.cuit);
    const existing = await this.sujetoRepo.findOne({ where: { spoCuit: cuit } });
    if (existing) {
      throw new UnprocessableEntityException('El CUIT ya está registrado');
    }
    const s = this.sujetoRepo.create({
      spoCuit: cuit,
      spoDenominacion: dto.denominacion.trim(),
    });
    const saved = await this.sujetoRepo.save(s);
    return this.toResponse(saved);
  }

  private toResponse(s: Sujeto) {
    return {
      id: s.spoId,
      cuit: s.spoCuit,
      denominacion: s.spoDenominacion,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }
}
