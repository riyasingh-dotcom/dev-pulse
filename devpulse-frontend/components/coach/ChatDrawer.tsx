"use client";

import { useEffect } from "react";
import { X, TrendingUp, AlertTriangle, Star, Flame } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import type { ChatMessage, GitHubSummary } from "@/lib/types";

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  summary: GitHubSummary;
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (msg: string) => void;
  hasReport: boolean;
};

type Insight = { type: "positive" | "warning"; label: string };

function getInsightChips(summary: GitHubSummary): Insight[] {
  const chips: Insight[] = [];

  if (summary.longestStreak >= 3)
    chips.push({ type: "positive", label: `${summary.longestStreak}-day streak 🔥` });

  const topDay = Object.entries(summary.commitsByDayOfWeek).sort(
    ([, a], [, b]) => b - a,
  )[0];
  if (topDay?.[1] > 0)
    chips.push({ type: "positive", label: `Peak: ${topDay[0].slice(0, 3)}` });

  if (summary.totalPRs < 3)
    chips.push({ type: "warning", label: `Low PRs (${summary.totalPRs})` });

  if (summary.mostActiveRepo)
    chips.push({ type: "positive", label: summary.mostActiveRepo.split("/").pop() ?? summary.mostActiveRepo });

  if (summary.activeDays < 7)
    chips.push({ type: "warning", label: `${summary.activeDays} active days` });

  return chips.slice(0, 4);
}

export function ChatDrawer({
  open,
  onClose,
  summary,
  messages,
  isLoading,
  onSend,
  hasReport,
}: ChatDrawerProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const chips = getInsightChips(summary);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="AI Coach chat"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[460px] bg-background border-l border-border flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center ring-1 ring-primary/30">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">DevPulse AI Coach</p>
              <p className="text-[11px] text-muted-foreground">
                Groq · llama-3.3-70b · {summary.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Today's insight chips */}
        {chips.length > 0 && (
          <div className="px-5 py-3 border-b border-border shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Today's Insights
            </p>
            <div className="flex gap-2 flex-wrap">
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                    chip.type === "positive"
                      ? "bg-green-500/10 text-green-400 border-green-500/25"
                      : "bg-orange-500/10 text-orange-400 border-orange-500/25"
                  }`}
                >
                  {chip.type === "positive" ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <AlertTriangle className="w-2.5 h-2.5" />
                  )}
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSend={onSend}
          summary={summary}
          hasReport={hasReport}
        />
      </div>
    </>
  );
}
