import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ChatRequestDto } from './chat.dto';
import { ChatService } from './chat.service';

type ChatResponse = { reply: string };

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponse> {
    const reply = await this.chatService.chat(
      dto.summary,
      dto.report,
      dto.messages,
    );
    return { reply };
  }
}
