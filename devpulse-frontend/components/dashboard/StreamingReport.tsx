"use client";

import { useEffect, useRef } from "react";
import { Bot, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseReport } from "@/lib/parseReport";

type Props = { report: string; isStreaming: boolean };

const SECTION_LABELS: Record<string, string> = {
  "OVERVIEW:": "Overview",
  "STRENGTHS:": "Strengths",
  "IMPROVEMENTS:": "Improvements",
  "WEEKLY_CHALLENGE:": "Weekly Challenge",
};

// ── Rendered view (after streaming) ──────────────────────────────────────────

function RenderedReport({ report }: { report: string }) {
  const { overview, strengths, improvements, weeklyChallenge } = parseReport(report);
  const hasStructured =
    overview ||
    strengths.length > 0 ||
    improvements.length > 0 ||
    weeklyChallenge.length > 0;

  if (!hasStructured) {
    return (
      <div className="text-[12px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {report}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[15px]">
      {overview && (
        <section>
          <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Overview
          </p>
          <p className="text-foreground/85 leading-relaxed">{overview}</p>
        </section>
      )}

      {strengths.length > 0 && (
        <section>
          <p className="text-[15px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">
            Strengths
          </p>
          <div className="space-y-1.5">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-foreground/80 leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {improvements.length > 0 && (
        <section>
          <p className="text-[15px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            Improvements
          </p>
          <div className="space-y-1.5">
            {improvements.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-foreground/80 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {weeklyChallenge.length > 0 && (
        <section>
          <p className="text-[12px] font-bold uppercase tracking-widest text-primary mb-2">
            Weekly Challenge
          </p>
          <div className="space-y-1.5">
            {weeklyChallenge.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15"
              >
                <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Live streaming view ───────────────────────────────────────────────────────

function StreamingText({ report }: { report: string }) {
  const labelRegex = /^(OVERVIEW:|STRENGTHS:|IMPROVEMENTS:|WEEKLY_CHALLENGE:|RULES:)$/m;
  const parts = report.split(labelRegex);

  return (
    <div className="text-sm leading-relaxed font-mono">
      {parts.map((part, i) => {
        if (SECTION_LABELS[part]) {
          return (
            <span key={i} className="block text-primary font-semibold mt-3 first:mt-0">
              {SECTION_LABELS[part]}
            </span>
          );
        }
        // Hide the RULES: label if the model leaks it
        if (part === "RULES:") return null;
        return (
          <span key={i} className="text-foreground/75 whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
      <span className="inline-block w-0.5 h-3 bg-primary animate-pulse ml-0.5 align-middle" />
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function StreamingReport({ report, isStreaming }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [report, isStreaming]);

  return (
    <div className="bg-card rounded-xl border border-border flex flex-col h-full min-h-80">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">AI Coach Report</p>
            <p className="text-[12px] text-muted-foreground">Groq · llama-3.3-70b-versatile</p>
          </div>
        </div>
        {isStreaming ? (
          <Badge
            variant="outline"
            className="gap-1.5 text-[11px] font-semibold bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/25"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AI LIVE
          </Badge>
        ) : report ? (
          <span className="text-[11px] text-muted-foreground">Complete</span>
        ) : null}
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
        {report ? (
          isStreaming ? (
            <StreamingText report={report} />
          ) : (
            <RenderedReport report={report} />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
              <Bot className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">AI report will stream here after analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
