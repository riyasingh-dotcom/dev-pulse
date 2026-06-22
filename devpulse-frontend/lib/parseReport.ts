export type ParsedReport = {
  overview: string;
  strengths: string[];
  improvements: string[];
  weeklyChallenge: string[];
};

export function parseReport(text: string): ParsedReport {
  const result: ParsedReport = {
    overview: "",
    strengths: [],
    improvements: [],
    weeklyChallenge: [],
  };

  type Section = "none" | "overview" | "strengths" | "improvements" | "weekly";
  let section: Section = "none";

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line === "OVERVIEW:")          { section = "overview";      continue; }
    if (line === "STRENGTHS:")         { section = "strengths";     continue; }
    if (line === "IMPROVEMENTS:")      { section = "improvements";  continue; }
    if (line === "WEEKLY_CHALLENGE:")  { section = "weekly";        continue; }
    // Stop capturing if the LLM leaks the RULES: block
    if (line === "RULES:")             { section = "none";          continue; }

    if (section === "overview") {
      result.overview = result.overview ? `${result.overview} ${line}` : line;
    } else if (section === "strengths") {
      const m = line.match(/^-\s+(.+)/);
      if (m) result.strengths.push(m[1].trim());
    } else if (section === "improvements") {
      const m = line.match(/^-\s+(.+)/);
      if (m) result.improvements.push(m[1].trim());
    } else if (section === "weekly") {
      const m = line.match(/^-\s+(.+)/);
      if (m) result.weeklyChallenge.push(m[1].trim());
    }
  }

  return result;
}
