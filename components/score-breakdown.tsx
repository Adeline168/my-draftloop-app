import type { Score } from "@/lib/types";
import { SCORE_DIMENSIONS } from "@/lib/types";
import { ReadinessBadge } from "@/components/status-badge";

const LABELS: Record<string, string> = {
  hook: "Hook",
  specificity: "Specificity",
  proof: "Proof",
  clarity: "Clarity",
  cta: "CTA",
  fit_to_platform: "Fit to platform",
  shareability: "Shareability",
};

export function ScoreBreakdown({ score, threshold }: { score: Score; threshold: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Score</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">
            {score.total}/70 <span className="text-neutral-400">(threshold {threshold})</span>
          </span>
          <ReadinessBadge passed={score.passed} />
        </div>
      </div>
      <div className="space-y-2">
        {SCORE_DIMENSIONS.map((dim) => {
          const value = score[dim];
          return (
            <div key={dim} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-xs text-neutral-600">{LABELS[dim]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full ${value >= 7 ? "bg-emerald-500" : value >= 4 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${(value / 10) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-medium text-neutral-700">{value}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        Scored by {score.source === "AI" ? "AI" : "manual entry"}
        {score.confidence != null ? ` · confidence ${(score.confidence * 100).toFixed(0)}%` : ""}
      </p>
    </div>
  );
}
