import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AutomotoresService } from './automotores.service';

@Controller('automotores')
export class AutomotoresController {
  constructor(private readonly automotoresService: AutomotoresService) {}

  @Get()
  findAll() {
    return this.automotoresService.findAll();
  }

  @Get(':dominio')
  findByDominio(@Param('dominio') dominio: string) {
    return this.automotoresService.findByDominio(dominio);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.automotoresService.create(body);
  }

  @Put(':dominio')
  update(@Param('dominio') dominio: string, @Body() body: unknown) {
    return this.automotoresService.update(dominio, body);
  }

  @Delete(':dominio')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('dominio') dominio: string): void {
    this.automotoresService.remove(dominio);
  }
}
