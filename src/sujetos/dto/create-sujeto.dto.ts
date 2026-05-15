import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSujetoDto {
  @IsString()
  @IsNotEmpty()
  cuit: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  denominacion: string;
}
