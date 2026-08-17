import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { NoticiaCacheService } from './noticia-cache.service';

@Injectable()
export class NoticiaService {
  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepository: Repository<Noticia>,
    private readonly noticiaCacheService: NoticiaCacheService,
  ) {}

  create(createNoticiaDto: CreateNoticiaDto): Promise<Noticia> {
    const noticia = this.noticiaRepository.create(createNoticiaDto);
    return this.noticiaRepository.save(noticia);
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const cacheParams = { page, limit, search };
    const cached = this.noticiaCacheService.get<{
      data: Noticia[];
      total: number;
      page: number;
      limit: number;
    }>(cacheParams);
    if (cached) {
      return cached;
    }

    const where = search
      ? [{ titulo: ILike(`%${search}%`) }, { descricao: ILike(`%${search}%`) }]
      : undefined;
    const [data, total] = await this.noticiaRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    const result = { data, total, page, limit };
    this.noticiaCacheService.set(cacheParams, result);
    return result;
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
