import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsObject,
  IsOptional,
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

class Last7DayDto {
  @IsString()
  date!: string;

  @IsString()
  day!: string;

  @IsNumber()
  @Min(0)
  commits!: number;
}

class RecentRepoActivityDto {
  @IsString()
  repo!: string;

  @IsNumber()
  @Min(0)
  commits!: number;

  @IsString()
  lastActive!: string;
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Last7DayDto)
  last7Days?: Array<{ date: string; day: string; commits: number }>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecentRepoActivityDto)
  recentRepoActivity?: Array<{ repo: string; commits: number; lastActive: string }>;
}

export class GenerateReportDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GitHubSummaryDto)
  summary!: GitHubSummaryDto;
}
