import { Injectable } from '@nestjs/common';

@Injectable()
export class AutomotoresService {
  findAll() {
    return [];
  }

  findByDominio(_dominio: string) {
    return null;
  }

  create(_payload: unknown) {
    return null;
  }

  update(_dominio: string, _payload: unknown) {
    return null;
  }

  remove(_dominio: string): void {}
}
