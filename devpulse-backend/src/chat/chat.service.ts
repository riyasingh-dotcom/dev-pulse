import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq, { APIError } from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import type { GitHubSummary } from '../github/github.service';
import { ChatRole, type ChatMessageDto } from './chat.dto';
import { buildChatSystemPrompt } from './chat.prompt';

@Injectable()
export class ChatService {
  private readonly groqApiKey: string;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('GROQ_API_KEY');
    if (!key) {
      throw new Error(
        'GROQ_API_KEY is not set. Add it to your .env file before starting the server.',
      );
    }
    this.groqApiKey = key;
  }

  async chat(
    summary: GitHubSummary,
    report: string,
    messages: ChatMessageDto[],
  ): Promise<string> {
    const last = messages[messages.length - 1];
    if (last?.role !== ChatRole.User) {
      throw new BadRequestException(
        'The last message in the conversation must have role "user".',
      );
    }

    const systemPrompt = buildChatSystemPrompt(summary, report);

    const groqMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(
        (m): ChatCompletionMessageParam => ({
          role: m.role,
          content: m.content,
        }),
      ),
    ];

    const groq = new Groq({ apiKey: this.groqApiKey });

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
      });

      const reply = completion.choices[0]?.message?.content;
      if (!reply) {
        throw new InternalServerErrorException('Groq returned an empty reply');
      }
      return reply;
    } catch (err) {
      if (
        err instanceof InternalServerErrorException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      const message =
        err instanceof APIError
          ? `Groq API error ${err.status}: ${err.message}`
          : 'Groq API is unavailable';
      throw new InternalServerErrorException(message);
    }
  }
}
