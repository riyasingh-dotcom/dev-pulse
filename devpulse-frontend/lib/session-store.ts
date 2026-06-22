import { calculateScores } from "./scoring";
import { loadSession, saveSession } from "./storage";
import type { GitHubSummary, ChatMessage, ProductivityScores } from "./types";

export type Session = {
  summary: GitHubSummary | null;
  scores: ProductivityScores | null;
  report: string;
  messages: ChatMessage[];
};

export const EMPTY_SESSION: Session = {
  summary: null,
  scores: null,
  report: "",
  messages: [],
};

// ── In-memory cache ──────────────────────────────────────────────────────────
// Null means "not yet read from localStorage". Set once on first client read.
let _cache: Session | null = null;
const _listeners = new Set<() => void>();

function notify(): void {
  _listeners.forEach((fn) => fn());
}

// ── useSyncExternalStore interface ───────────────────────────────────────────

export function subscribe(onChange: () => void): () => void {
  _listeners.add(onChange);
  return () => _listeners.delete(onChange);
}

export function getSnapshot(): Session {
  if (_cache !== null) return _cache;
  const saved = loadSession();
  _cache = saved
    ? {
        summary: saved.summary,
        scores: calculateScores(saved.summary),
        report: saved.report,
        messages: saved.messages,
      }
    : EMPTY_SESSION;
  return _cache;
}

// Server always returns empty — prevents hydration mismatch
export function getServerSnapshot(): Session {
  return EMPTY_SESSION;
}

// ── Mutators (called from event handlers / async callbacks, never effects) ──

export function setSession(next: Session): void {
  _cache = next;
  notify();
}

export function updateSession(updater: (prev: Session) => Session): void {
  _cache = updater(getSnapshot());
  notify();
}

export function resetSession(): void {
  _cache = EMPTY_SESSION;
  notify();
}

// Writes current cache to localStorage. Call this from a useEffect that
// "syncs React state to an external system" (the only effect pattern the
// linter accepts).
export function persistSession(): void {
  if (_cache?.summary) {
    saveSession({
      summary: _cache.summary,
      report: _cache.report,
      messages: _cache.messages,
    });
  }
}
