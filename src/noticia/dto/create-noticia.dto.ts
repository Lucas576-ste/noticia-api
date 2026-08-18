import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoticiaDto {
  @ApiProperty({ example: 'Nest 11 lançado' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    example: 'Nova versão do NestJS traz melhorias de performance.',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;
}
