import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAutomotorDto {
  @IsString()
  @IsNotEmpty()
  dominio: string;

  /** CUIT del titular ya registrado como Sujeto */
  @IsString()
  @IsNotEmpty()
  cuit: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  numeroChasis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  numeroMotor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;

  /** YYYYMM */
  @Type(() => Number)
  @IsInt()
  @Min(190001)
  @Max(299912)
  fechaFabricacion: number;
}
