import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';

@Injectable()
export class NoticiaService {
  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepository: Repository<Noticia>,
  ) {}

  create(createNoticiaDto: CreateNoticiaDto): Promise<Noticia> {
    const noticia = this.noticiaRepository.create(createNoticiaDto);
    return this.noticiaRepository.save(noticia);
  }

  findAll(): Promise<Noticia[]> {
    return this.noticiaRepository.find();
  }

  async findOne(id: number): Promise<Noticia> {
    const noticia = await this.noticiaRepository.findOneBy({ id });
    if (!noticia) {
      throw new NotFoundException(`Notícia com id ${id} não encontrada`);
    }
    return noticia;
  }

  async update(
    id: number,
    updateNoticiaDto: UpdateNoticiaDto,
  ): Promise<Noticia> {
    const noticia = await this.findOne(id);
    Object.assign(noticia, updateNoticiaDto);
    return this.noticiaRepository.save(noticia);
  }

  async remove(id: number): Promise<void> {
    const noticia = await this.findOne(id);
    await this.noticiaRepository.remove(noticia);
  }
}
