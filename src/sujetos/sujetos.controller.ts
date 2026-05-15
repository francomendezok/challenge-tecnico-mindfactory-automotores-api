import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SujetosService } from './sujetos.service';

@Controller('sujetos')
export class SujetosController {
  constructor(private readonly sujetosService: SujetosService) {}

  @Get('by-cuit/:cuit')
  findByCuit(@Param('cuit') cuit: string) {
    return this.sujetosService.findByCuit(cuit);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.sujetosService.create(body);
  }
}
