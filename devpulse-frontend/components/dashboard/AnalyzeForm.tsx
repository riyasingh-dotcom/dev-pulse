"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type AnalyzeFormProps = {
  onAnalyze: (username: string) => void;
  isLoading: boolean;
};

export function AnalyzeForm({ onAnalyze, isLoading }: AnalyzeFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const username = value
      .trim()
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/^@/, "")
      .replace(/\/$/, "");
    if (username) onAnalyze(username);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        {/* Left: heading */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold tracking-tight">Analyze GitHub Profile</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Connect your developer identity to generate real-time productivity insights.
          </p>
        </div>

        {/* Right: form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none pointer-events-none">
              github.com/
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="username"
              className="pl-23 w-full sm:w-52 h-9"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="h-9 px-5 font-semibold shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Analyze"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
