import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateNoticiaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descricao?: string;
}
