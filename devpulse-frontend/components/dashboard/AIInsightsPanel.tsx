"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AIInsightsPanelProps = {
  report: string;
  isStreaming: boolean;
};

type Parsed = {
  overview: string;
  strengths: string[];
  improvements: string[];
};

function parseReport(text: string): Parsed {
  const overview: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  type Section = "none" | "overview" | "strengths" | "improvements" | "metrics";
  let section: Section = "none";

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line === "OVERVIEW:")   { section = "overview";      continue; }
    if (line === "STRENGTHS:")  { section = "strengths";     continue; }
    if (line === "IMPROVEMENTS:") { section = "improvements"; continue; }
    if (line === "METRICS:")    { section = "metrics";       continue; }

    if (section === "overview") {
      overview.push(line);
    } else if (section === "strengths") {
      const m = line.match(/^-\s+(.+)/);
      if (m) strengths.push(m[1].trim());
    } else if (section === "improvements") {
      const m = line.match(/^-\s+(.+)/);
      if (m) improvements.push(m[1].trim());
    }
  }

  return {
    overview: overview.join(" "),
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
}

export function AIInsightsPanel({ report, isStreaming }: AIInsightsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [report, isStreaming]);

  const { overview, strengths, improvements } = parseReport(report);
  const hasContent = strengths.length > 0 || improvements.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-sm font-bold text-foreground">AI Productivity Insights</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
            {isStreaming || !overview
              ? "Personalized optimization report generated from your recent activity."
              : overview}
          </p>
        </div>
        {isStreaming && (
          <Badge
            variant="outline"
            className="shrink-0 gap-1.5 text-[11px] font-semibold bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/25 px-2 py-0.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AI LIVE
          </Badge>
        )}
      </div>

      <div className="flex-1 mt-4 min-h-0">
        {isStreaming ? (
          /* Raw clean text while streaming — format has no markdown so it reads well */
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap pr-1"
          >
            {report}
            <span className="inline-block w-0.5 h-3.5 bg-primary animate-pulse ml-0.5 align-middle" />
          </div>
        ) : hasContent ? (
          /* Structured two-column view */
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                <CheckCircle2 className="w-3 h-3" /> Key Insights
              </p>
              <div className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((item, i) => (
                    <div key={i} className="flex gap-2 text-[12px] text-foreground/80 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <InsightSkeletons count={2} />
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3 h-3" /> Focus Areas
              </p>
              <div className="space-y-2">
                {improvements.length > 0 ? (
                  improvements.map((item, i) => (
                    <div key={i} className="flex gap-2 text-[12px] text-foreground/80 leading-snug">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <InsightSkeletons count={2} />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InsightSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-1 animate-pulse">
          <div className="h-2.5 bg-muted rounded w-full" />
          <div className="h-2.5 bg-muted rounded w-4/5" />
        </div>
      ))}
    </>
  );
}
