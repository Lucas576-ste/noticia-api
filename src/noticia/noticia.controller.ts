import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoticiaService } from './noticia.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';

@ApiTags('noticias')
@Controller('noticias')
export class NoticiaController {
  constructor(private readonly noticiaService: NoticiaService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova notícia' })
  @ApiResponse({ status: 201, description: 'Notícia criada com sucesso' })
  create(@Body() createNoticiaDto: CreateNoticiaDto) {
    return this.noticiaService.create(createNoticiaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista notícias, com paginação e filtro' })
  @ApiResponse({ status: 200, description: 'Lista paginada de notícias' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.noticiaService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma notícia pelo id' })
  @ApiResponse({ status: 200, description: 'Notícia encontrada' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticiaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma notícia' })
  @ApiResponse({ status: 200, description: 'Notícia atualizada' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticiaDto: UpdateNoticiaDto,
  ) {
    return this.noticiaService.update(id, updateNoticiaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma notícia' })
  @ApiResponse({ status: 204, description: 'Notícia removida' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticiaService.remove(id);
  }
}
