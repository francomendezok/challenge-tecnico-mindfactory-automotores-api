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
import { CreateAutomotorDto } from './dto/create-automotor.dto';
import { UpdateAutomotorDto } from './dto/update-automotor.dto';

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
  create(@Body() body: CreateAutomotorDto) {
    return this.automotoresService.create(body);
  }

  @Put(':dominio')
  update(@Param('dominio') dominio: string, @Body() body: UpdateAutomotorDto) {
    return this.automotoresService.update(dominio, body);
  }

  @Delete(':dominio')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('dominio') dominio: string): Promise<void> {
    await this.automotoresService.remove(dominio);
  }
}
