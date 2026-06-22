import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GitHubSummaryDto } from '../report/report.dto';

export enum ChatRole {
  User = 'user',
  Assistant = 'assistant',
}

export class ChatMessageDto {
  @IsEnum(ChatRole)
  role!: ChatRole;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ChatRequestDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GitHubSummaryDto)
  summary!: GitHubSummaryDto;

  @IsString()
  @IsNotEmpty()
  report!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}
