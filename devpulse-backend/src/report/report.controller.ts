import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { MessageEvent } from '@nestjs/common';
import { GenerateReportDto } from './report.dto';
import { ReportService } from './report.service';

const formatSseEvent = (event: MessageEvent): string => {
  const raw =
    typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
  // Escape newlines so they don't break SSE framing — frontend unescapes on receipt
  const data = raw.replace(/\r\n/g, '\\n').replace(/\n/g, '\\n').replace(/\r/g, '');
  let frame = '';
  if (event.id) frame += `id: ${event.id}\n`;
  if (event.type) frame += `event: ${event.type}\n`;
  frame += `data: ${data}\n\n`;
  return frame;
};

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('stream')
  stream(
    @Body() dto: GenerateReportDto,
    @Req() req: Request,
    @Res() res: Response,
  ): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx/proxy buffering
    res.flushHeaders();

    const sub = this.reportService.streamReport(dto.summary).subscribe({
      next: (event) => res.write(formatSseEvent(event)),
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Stream error';
        res.write(formatSseEvent({ data: message, type: 'error' }));
        res.end();
      },
      complete: () => res.end(),
    });

    // Abort the Groq stream and release resources when the client disconnects
    req.on('close', () => sub.unsubscribe());
  }
}
