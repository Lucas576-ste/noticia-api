import { defineFeature, loadFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { NoticiaController } from './../src/noticia/noticia.controller';
import { NoticiaService } from './../src/noticia/noticia.service';
import { NoticiaCacheService } from './../src/noticia/noticia-cache.service';
import { Noticia } from './../src/noticia/entities/noticia.entity';

const feature = loadFeature('./test/features/criacao-noticia.feature');

defineFeature(feature, (test) => {
  let app: INestApplication<App>;
  let noticiaRepositoryMock: { create: jest.Mock; save: jest.Mock };
  let payload: Record<string, unknown>;
  let response: request.Response;

  beforeEach(async () => {
    noticiaRepositoryMock = {
      create: jest.fn((dto) => dto),
      save: jest.fn((noticia) => Promise.resolve({ id: 1, ...noticia })),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NoticiaController],
      providers: [
        NoticiaService,
        NoticiaCacheService,
        { provide: getRepositoryToken(Noticia), useValue: noticiaRepositoryMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  test('Payload válido cria a notícia', ({ given, when, then }) => {
    given('um payload válido com titulo e descricao', () => {
      payload = { titulo: 'Nest 11 lançado', descricao: 'Nova versão traz melhorias.' };
    });

    when('eu envio POST /noticias', async () => {
      response = await request(app.getHttpServer()).post('/noticias').send(payload);
    });

    then('a API responde 201 com a notícia criada', () => {
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 1, ...payload });
      expect(noticiaRepositoryMock.save).toHaveBeenCalled();
    });
  });

  test('Payload sem o titulo é rejeitado', ({ given, when, then }) => {
    given('um payload sem o campo titulo', () => {
      payload = { descricao: 'Falta o título.' };
    });

    when('eu envio POST /noticias', async () => {
      response = await request(app.getHttpServer()).post('/noticias').send(payload);
    });

    then('a API responde 400 e não persiste nada', () => {
      expect(response.status).toBe(400);
      expect(noticiaRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  test('Payload com campo fora do DTO é rejeitado', ({ given, when, then }) => {
    given('um payload com o campo autor além de titulo e descricao', () => {
      payload = { titulo: 'Título válido', descricao: 'Descrição válida.', autor: 'Redação' };
    });

    when('eu envio POST /noticias', async () => {
      response = await request(app.getHttpServer()).post('/noticias').send(payload);
    });

    then('a API responde 400 e não persiste nada', () => {
      expect(response.status).toBe(400);
      expect(noticiaRepositoryMock.save).not.toHaveBeenCalled();
    });
  });
});
