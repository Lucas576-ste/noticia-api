import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Noticia } from './entities/noticia.entity';
import { NoticiaService } from './noticia.service';
import { NoticiaController } from './noticia.controller';
import { NoticiaCacheService } from './noticia-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Noticia])],
  controllers: [NoticiaController],
  providers: [NoticiaService, NoticiaCacheService],
  exports: [NoticiaService],
})
export class NoticiaModule {}
