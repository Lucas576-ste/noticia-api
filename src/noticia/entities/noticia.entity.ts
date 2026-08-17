import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column('text')
  descricao: string;
}
