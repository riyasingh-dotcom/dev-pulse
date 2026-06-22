import type { GitHubSummary, ChatMessage } from "./types";

// Bump this version whenever GitHubSummary gains required fields — forces a
// fresh API call instead of silently restoring an incomplete cached summary.
const SESSION_KEY = "devpulse_session_v2";

type PersistedSession = {
  summary: GitHubSummary;
  report: string;
  messages: ChatMessage[];
};

export function loadSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

export function saveSession(data: PersistedSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or unavailable — silently skip
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
