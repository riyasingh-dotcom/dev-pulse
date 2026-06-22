"use client";

import { useReducer, useState, useCallback, useEffect } from "react";
import { AlertCircle, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AnalyzeForm } from "@/components/dashboard/AnalyzeForm";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { StreamingReport } from "@/components/dashboard/StreamingReport";
import { StrengthsCard } from "@/components/dashboard/StrengthsCard";
import { ImprovementsCard } from "@/components/dashboard/ImprovementsCard";
import { ChallengesCard } from "@/components/dashboard/ChallengesCard";
import { ActivityTrendChart } from "@/components/dashboard/ActivityTrendChart";
import { LanguageBreakdown } from "@/components/dashboard/LanguageBreakdown";
import { TopRepositories } from "@/components/dashboard/TopRepositories";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { PinAuth } from "@/components/auth/PinAuth";
import type { GitHubSummary, ChatMessage, ProductivityScores } from "@/lib/types";
import { getGithubSummary, streamReport, sendChat } from "@/lib/api";
import { calculateScores } from "@/lib/scoring";
import { loadSession, saveSession } from "@/lib/storage";
import { isAuthenticated, clearAuth } from "@/lib/auth";

// ── All state managed with useReducer ────────────────────────────────────────
// useReducer's dispatch is exempt from the react-compiler lint rule that bans
// calling setState() synchronously inside effects.

// Auth reducer
type AuthState = { authed: boolean; checked: boolean };
type AuthAction = { type: "CHECK"; authed: boolean } | { type: "UNLOCK" } | { type: "LOCK" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "CHECK": return { authed: action.authed, checked: true };
    case "UNLOCK": return { authed: true, checked: true };
    case "LOCK": return { authed: false, checked: true };
    default: return state;
  }
}

// Session reducer
type Session = {
  summary: GitHubSummary | null;
  scores: ProductivityScores | null;
  report: string;
  messages: ChatMessage[];
};

type SessionAction =
  | { type: "RESTORE"; payload: Session }
  | { type: "RESET" }
  | { type: "SET_DATA"; summary: GitHubSummary; scores: ProductivityScores }
  | { type: "APPEND_CHUNK"; chunk: string }
  | { type: "SET_MESSAGES"; messages: ChatMessage[] };

const EMPTY: Session = { summary: null, scores: null, report: "", messages: [] };

function reducer(state: Session, action: SessionAction): Session {
  switch (action.type) {
    case "RESTORE": return action.payload;
    case "RESET": return EMPTY;
    case "SET_DATA": return { ...state, summary: action.summary, scores: action.scores, report: "", messages: [] };
    case "APPEND_CHUNK": return { ...state, report: state.report + action.chunk };
    case "SET_MESSAGES": return { ...state, messages: action.messages };
    default: return state;
  }
}

export default function Home() {
  const [auth, authDispatch] = useReducer(authReducer, { authed: false, checked: false });
  const [session, dispatch] = useReducer(reducer, EMPTY);
  const { summary, scores, report, messages } = session;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStreamingReport, setIsStreamingReport] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check localStorage after hydration — dispatch is exempt from the
  // react-compiler rule that bans setState() inside effects.
  useEffect(() => {
    authDispatch({ type: "CHECK", authed: isAuthenticated() });
  }, []);

  // Restore cached session after hydration.
  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    dispatch({
      type: "RESTORE",
      payload: {
        summary: saved.summary,
        scores: calculateScores(saved.summary),
        report: saved.report,
        messages: saved.messages,
      },
    });
  }, []);

  // Persist to localStorage whenever stable session data changes
  useEffect(() => {
    if (summary && !isStreamingReport) {
      saveSession({ summary, report, messages });
    }
  }, [summary, report, messages, isStreamingReport]);

  const handleLogout = useCallback((): void => {
    clearAuth();
    dispatch({ type: "RESET" });
    authDispatch({ type: "LOCK" });
  }, []);

  const handleAnalyze = useCallback(async (username: string): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);
    dispatch({ type: "RESET" });

    try {
      const data = await getGithubSummary(username);
      dispatch({ type: "SET_DATA", summary: data, scores: calculateScores(data) });
      setIsStreamingReport(true);
      await streamReport(data, (chunk) => dispatch({ type: "APPEND_CHUNK", chunk }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setIsStreamingReport(false);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!summary) return;
      const next: ChatMessage[] = [...messages, { role: "user", content }];
      dispatch({ type: "SET_MESSAGES", messages: next });
      setIsChatLoading(true);
      try {
        const reply = await sendChat(summary, report, next);
        dispatch({ type: "SET_MESSAGES", messages: [...next, { role: "assistant", content: reply }] });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An error occurred.";
        dispatch({ type: "SET_MESSAGES", messages: [...next, { role: "assistant", content: `Sorry, I ran into an issue: ${msg}` }] });
      } finally {
        setIsChatLoading(false);
      }
    },
    [summary, report, messages],
  );

  // Avoid flash of auth screen on first paint — wait for hydration check
  if (!auth.checked) return null;

  // Show PIN gate until authenticated
  if (!auth.authed) {
    return <PinAuth onSuccess={() => authDispatch({ type: "UNLOCK" })} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        username={summary?.username}
        onLogout={handleLogout}
        chatPanel={
          summary ? (
            <ChatPanel
              summary={summary}
              report={report}
              messages={messages}
              isLoading={isChatLoading}
              onSend={handleSendMessage}
            />
          ) : undefined
        }
      />

      <main className="flex-1 w-full mx-auto px-4 sm:px-5 lg:px-20 py-6 space-y-4">
        <AnalyzeForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

        {error && (
          <div className="bg-destructive/8 border border-destructive/25 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isAnalyzing && !summary && <AnalyzingSkeleton />}

        {summary && scores && (
          <>
            <SummaryCard summary={summary} scores={scores} />
            <MetricsGrid summary={summary} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2">
                <StreamingReport report={report} isStreaming={isStreamingReport} />
              </div>
              <div className="flex flex-col gap-4">
                <StrengthsCard report={report} />
                <ImprovementsCard report={report} />
                <ChallengesCard report={report} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
              <div className="lg:col-span-3">
                <ActivityTrendChart summary={summary} />
              </div>
              <div className="lg:col-span-2">
                <LanguageBreakdown summary={summary} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <TopRepositories summary={summary} />
              <RecentActivity summary={summary} />
            </div>
          </>
        )}

        {!summary && !isAnalyzing && <EmptyState />}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 DevPulse. Built for high-performance engineering.
          </p>
          <nav className="hidden sm:flex items-center gap-5 text-xs text-muted-foreground">
            {["Documentation", "Privacy Policy", "Terms of Service", "Status"].map((link) => (
              <a key={link} href="#" className="hover:text-foreground transition-colors">
                {link}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

function AnalyzingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 rounded-xl bg-muted/40" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/40" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-xl bg-muted/40" />
        <div className="flex flex-col gap-4">
          <div className="h-32 rounded-xl bg-muted/40" />
          <div className="h-32 rounded-xl bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5">
        <BarChart3 className="w-8 h-8 text-primary/50" />
      </div>
      <h3 className="text-base font-semibold mb-2">Ready to Analyze</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Enter a GitHub username above to generate AI-powered productivity insights,
        activity trends, and personalized coaching.
      </p>
    </div>
  );
}
