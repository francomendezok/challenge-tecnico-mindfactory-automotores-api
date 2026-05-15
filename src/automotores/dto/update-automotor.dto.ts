import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateAutomotorDto {
  @IsOptional()
  @IsString()
  cuit?: string;

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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(190001)
  @Max(299912)
  fechaFabricacion?: number;
}
