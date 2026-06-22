import { Controller, Get, Param } from '@nestjs/common';
import { GithubService, GithubProfile, GitHubSummary } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
  ): Promise<GithubProfile> {
    return await this.githubService.getProfile(username);
  }

  @Get(':username/summary')
  async getSummary(
    @Param('username') username: string,
  ): Promise<GitHubSummary> {
    return await this.githubService.getSummary(username);
  }
}
