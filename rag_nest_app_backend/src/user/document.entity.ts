import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('tbl_documents') // Map to tbl_documents table
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  documentName: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'CASCADE' })
  user: User;
}
