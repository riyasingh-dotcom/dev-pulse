import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import Groq, { APIError } from 'groq-sdk';
import { Stream } from 'groq-sdk/core/streaming';
import type { ChatCompletionChunk } from 'groq-sdk/resources/chat/completions';
import type { MessageEvent } from '@nestjs/common';
import type { GitHubSummary } from '../github/github.service';
import { REPORT_SYSTEM_PROMPT } from './prompt.constants';

@Injectable()
export class ReportService {
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

  streamReport(summary: GitHubSummary): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const groq = new Groq({ apiKey: this.groqApiKey });
      const userPrompt = this.buildPrompt(summary);

      // Declared in the outer closure so the teardown function can abort it
      let groqStream: Stream<ChatCompletionChunk> | null = null;

      const run = async (): Promise<void> => {
        try {
          groqStream = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: REPORT_SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            stream: true,
          });

          for await (const chunk of groqStream) {
            if (subscriber.closed) break;
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              subscriber.next({ data: delta });
            }
          }

          if (!subscriber.closed) {
            subscriber.next({ data: '[DONE]', type: 'done' });
            subscriber.complete();
          }
        } catch (err) {
          if (subscriber.closed) return;

          // Client disconnected before stream finished — abort cleanly
          if (err instanceof Error && err.name === 'AbortError') {
            subscriber.complete();
            return;
          }

          const message =
            err instanceof APIError
              ? `Groq API error ${err.status}: ${err.message}`
              : 'Groq API is unavailable';
          subscriber.error(new InternalServerErrorException(message));
        }
      };

      void run();

      // Teardown: called when the client disconnects or unsubscribes
      return () => {
        groqStream?.controller.abort();
      };
    });
  }

  private buildPrompt(summary: GitHubSummary): string {
    const topRepos =
      summary.topRepos.length > 0
        ? summary.topRepos
            .map((r) => `  - ${r.name}: ${r.commits} push event(s)`)
            .join('\n')
        : '  None';

    const languages =
      Object.keys(summary.languageBreakdown).length > 0
        ? Object.entries(summary.languageBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([lang, count]) => `  - ${lang}: ${count} repo(s)`)
            .join('\n')
        : '  None';

    const dayActivity = Object.entries(summary.commitsByDayOfWeek)
      .map(([day, count]) => `  - ${day}: ${count}`)
      .join('\n');

    return `Review the following GitHub activity for developer "${summary.username}":

Period: ${summary.period}

Activity Metrics:
- Total commits (push events in window): ${summary.totalCommits}
- Total PRs authored (all-time): ${summary.totalPRs}
- Total issues closed (all-time): ${summary.totalIssuesClosed}
- Active days in period: ${summary.activeDays}
- Longest consecutive streak: ${summary.longestStreak} day(s)
- Most active repository: ${summary.mostActiveRepo || 'N/A'}

Top Repositories by Push Events:
${topRepos}

Language Breakdown by Repository Count:
${languages}

Push Events by Day of Week:
${dayActivity}

Provide a coaching report with all four sections: Productivity Overview, Strengths, Areas for Improvement, and Weekly Challenge.`;
  }
}
