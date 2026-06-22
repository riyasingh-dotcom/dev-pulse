"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Code2 } from "lucide-react";
import type { ChatMessage, GitHubSummary } from "@/lib/types";
import { CycleTimeChart } from "./CycleTimeChart";

type ChatInterfaceProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  summary: GitHubSummary;
  hasReport: boolean;
};

const QUICK_PROMPTS = [
  "How can I improve my PR cycle time?",
  "Tips for Friday reviews",
  "How to improve consistency?",
  "Show PR size breakdown",
];

export function ChatInterface({
  messages,
  isLoading,
  onSend,
  summary,
  hasReport,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleQuickPrompt = (prompt: string): void => {
    if (!isLoading) onSend(prompt);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-sm font-medium">DevPulse AI Coach</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              {hasReport
                ? "I've analyzed your GitHub activity. Ask me anything about your patterns."
                : "Analyzing recent activity…"}
            </p>
            {hasReport && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {QUICK_PROMPTS.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleQuickPrompt(p)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const isLastAssistant = !isUser && i === messages.length - 1;
          return (
            <div
              key={i}
              className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-xl px-3 py-2.5 text-sm ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {isLastAssistant && (
                  <>
                    <CycleTimeChart summary={summary} />
                    <div className="flex gap-3 mt-2">
                      {QUICK_PROMPTS.slice(0, 2).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleQuickPrompt(p)}
                          disabled={isLoading}
                          className="text-xs text-primary hover:underline disabled:opacity-50"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      AI Coach · Just now
                    </p>
                  </>
                )}
              </div>
              {isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 ml-2 mt-0.5 text-xs font-medium text-primary">
                  {summary.username[0].toUpperCase()}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mr-2">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </ScrollArea>

      <div className="px-4 py-3 border-t border-border shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message DevPulse AI Coach…"
            className="flex-1"
            disabled={isLoading || !hasReport}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || !hasReport}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          DevPulse AI Coach provides insights based on your GitHub activity
        </p>
      </div>
    </div>
  );
}
