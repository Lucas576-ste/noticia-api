import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoticiaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;
}
