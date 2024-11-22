import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service'; // Import UserService
import * as jwt from 'jsonwebtoken';

const privateKey = 'private.pem'; // Replace with your private key

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {} // Inject UserService

  @Post('register')
  async register(@Body() body) {
    const { username, email, password } = body;
    const result = await this.userService.register(username, email, password);
    if ('message' in result) {
      return { message: result.message };
    } else {
      const token = jwt.sign({ userId: result.id }, privateKey);
      return { token };
    }
  }

  @Post('login')
  async login(@Body() body) {
    const { username, password } = body;
    const result = await this.userService.login(username, password);
    if ('message' in result) {
      return { message: result.message };
    }
    const token = jwt.sign({ userId: result.id }, privateKey);
    return { token };
  }

  @Post('logout')
  async logout() {
    return { message: 'Logout successful' };
  }

  @Post('upload-document')
  async uploadDocument(@Body() body) {
    const { username, documentName, content } = body;
    const timestamp = Date.now();
    const documentNameWithTimestamp = `${documentName.split('.').slice(0, -1).join('.')}_${timestamp}.${documentName.split('.').pop()}`;
    await this.userService.uploadDocument(username, documentNameWithTimestamp, content);
    return { message: 'Document uploaded successfully' };
  }

  @Get('fetch-documents/:username')
  async fetchDocuments(@Param('username') username: string) {
    const documents = await this.userService.fetchDocuments(username);
    return { username, documents };
  }
}