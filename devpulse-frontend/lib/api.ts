import type { GitHubSummary, ChatMessage } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function getGithubSummary(
  username: string,
): Promise<GitHubSummary> {
  const res = await fetch(
    `${API_BASE}/github/${encodeURIComponent(username)}/summary`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `GitHub fetch failed (${res.status})`);
  }
  return res.json() as Promise<GitHubSummary>;
}

export async function streamReport(
  summary: GitHubSummary,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_BASE}/report/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summary }),
    signal,
  });

  if (!res.ok) throw new Error(`Stream failed (${res.status})`);
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6); // preserve leading spaces — LLM tokens like " commit" carry word-separator spaces
          if (data.trim() === "[DONE]") return;
          // Unescape newlines that were escaped to preserve SSE framing
          if (data) onChunk(data.replace(/\\n/g, "\n"));
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function sendChat(
  summary: GitHubSummary,
  report: string,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summary, report, messages }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Chat failed (${res.status})`);
  }

  const data = await res.json() as { reply: string };
  return data.reply;
}
