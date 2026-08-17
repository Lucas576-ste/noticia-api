import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { NoticiaService } from './noticia.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';

@Controller('noticia')
export class NoticiaController {
  constructor(private readonly noticiaService: NoticiaService) {}

  @Post()
  create(@Body() createNoticiaDto: CreateNoticiaDto) {
    return this.noticiaService.create(createNoticiaDto);
  }

  @Get()
  findAll() {
    return this.noticiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticiaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticiaDto: UpdateNoticiaDto,
  ) {
    return this.noticiaService.update(id, updateNoticiaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticiaService.remove(id);
  }
}
