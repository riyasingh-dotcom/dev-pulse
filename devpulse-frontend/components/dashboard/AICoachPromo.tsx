"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type AICoachPromoProps = {
  onOpenCoach: () => void;
};

export function AICoachPromo({ onOpenCoach }: AICoachPromoProps) {
  return (
    <div className="rounded-xl bg-[#0f172a] dark:bg-[#0a0f1e] p-5 h-full flex flex-col justify-between">
      {/* Icon + title */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <span className="text-lg">🤖</span>
        </div>
        <span className="text-sm font-bold text-white">AI Coach</span>
      </div>

      {/* Quote */}
      <p className="text-[13px] text-slate-300 leading-relaxed flex-1">
        "You've been pushing heavily after 10 PM lately. Consider shifting deep work
        sessions to the morning to maintain architectural consistency."
      </p>

      {/* CTA */}
      <Button
        onClick={onOpenCoach}
        className="mt-4 w-full bg-white text-[#0f172a] hover:bg-slate-100 font-semibold text-sm h-9 gap-2"
      >
        Chat with Coach
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
