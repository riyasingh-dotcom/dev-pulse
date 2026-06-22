import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsObject,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class TopRepoDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  commits!: number;
}

export class GitHubSummaryDto {
  @IsString()
  username!: string;

  @IsString()
  period!: string;

  @IsNumber()
  @Min(0)
  totalCommits!: number;

  @IsNumber()
  @Min(0)
  totalPRs!: number;

  @IsNumber()
  @Min(0)
  totalIssuesClosed!: number;

  @IsString()
  mostActiveRepo!: string;

  @IsNumber()
  @Min(0)
  activeDays!: number;

  @IsNumber()
  @Min(0)
  longestStreak!: number;

  @IsObject()
  languageBreakdown!: Record<string, number>;

  @IsObject()
  commitsByDayOfWeek!: Record<string, number>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopRepoDto)
  topRepos!: Array<{ name: string; commits: number }>;
}

export class GenerateReportDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GitHubSummaryDto)
  summary!: GitHubSummaryDto;
}
