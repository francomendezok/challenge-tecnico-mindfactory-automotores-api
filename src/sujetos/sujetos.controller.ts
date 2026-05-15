import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SujetosService } from './sujetos.service';
import { CreateSujetoDto } from './dto/create-sujeto.dto';

@Controller('sujetos')
export class SujetosController {
  constructor(private readonly sujetosService: SujetosService) {}

  @Get('by-cuit/:cuit')
  findByCuit(@Param('cuit') cuit: string) {
    return this.sujetosService.findByCuit(cuit);
  }

  @Post()
  create(@Body() body: CreateSujetoDto) {
    return this.sujetosService.create(body);
  }
}
