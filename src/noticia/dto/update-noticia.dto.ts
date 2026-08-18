import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNoticiaDto {
  @ApiProperty({ example: 'Nest 11 lançado (atualizado)', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titulo?: string;

  @ApiProperty({
    example: 'Descrição atualizada da notícia.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descricao?: string;
}
