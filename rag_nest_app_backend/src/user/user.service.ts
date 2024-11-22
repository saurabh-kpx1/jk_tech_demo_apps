import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Document } from './document.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async register(username: string, email: string, password: string): Promise<User | { message: string }> {
    const existingUser = await this.userRepository.findOneBy({ username });
    if (existingUser) {
      return { message: 'User already exists' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, email, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async login(username: string, password: string): Promise<User | { message: string }> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      return { message: 'User not registered' };
    }
    if (await bcrypt.compare(password, user.password)) {
      return user;
    }
    return { message: 'Invalid password' };
  }

  async uploadDocument(username: string, documentName: string, content: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new Error('User not found');
    }

    const document = this.documentRepository.create({ documentName, content, user });
    await this.documentRepository.save(document);
  }

  async fetchDocuments(username: string): Promise<{ username: string; documents: string[] }> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['documents'],
    });
    if (!user) {
      return { username, documents: [] };
    }
    return { username, documents: user.documents.map((doc) => doc.documentName) };
  }
}
