"use client";

import { useEffect, useState } from "react";

type LoadingStage = "idle" | "research" | "analysis" | "prd";

const STEPS: Array<{
  id: LoadingStage;
  label: string;
  emoji: string;
  est: string;
}> = [
  { id: "research",  label: "Researching competitors",        emoji: "🔍", est: "~10s" },
  { id: "analysis",  label: "Building competitive analysis",  emoji: "🧠", est: "~15s" },
  { id: "prd",       label: "Generating PRD",                 emoji: "📝", est: "~20s" },
];

const LIVE_INSIGHTS = [
  "Found 8 competitors in AI scheduling…",
  "Analyzing pricing models…",
  "Mapping feature gaps…",
  "Generating persona profiles…",
];

const STAGE_ORDER: LoadingStage[] = ["research", "analysis", "prd"];

function stageIndex(stage: LoadingStage): number {
  return STAGE_ORDER.indexOf(stage);
}

interface AnalysisProgressProps {
  stage: LoadingStage;
  onCancel: () => void;
}

export default function AnalysisProgress({
  stage,
  onCancel,
}: AnalysisProgressProps) {
  const [insightIdx, setInsightIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setInsightIdx((i) => (i + 1) % LIVE_INSIGHTS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const current = stageIndex(stage);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      {/* Top-left app name */}
      <div className="px-6 py-5">
        <span className="text-sm font-semibold text-zinc-400 tracking-widest uppercase">
          AI Product Sense
        </span>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        {/* Step list */}
        <div className="w-full max-w-sm space-y-4">
          {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            const locked = i > current;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                  active
                    ? "bg-zinc-800 border border-zinc-700"
                    : "opacity-40"
                }`}
              >
                {/* Status icon */}
                <span className="text-xl w-6 text-center">
                  {done ? (
                    <span className="text-emerald-400">✓</span>
                  ) : active ? (
                    <span className="inline-block animate-spin text-indigo-400">⟳</span>
                  ) : (
                    <span>{step.emoji}</span>
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      done
                        ? "text-emerald-400"
                        : active
                        ? "text-white"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.emoji} {step.label}
                  </p>
                </div>

                <span
                  className={`text-xs shrink-0 ${
                    locked ? "text-zinc-700" : "text-zinc-500"
                  }`}
                >
                  {step.est}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live insights */}
        <div className="h-6 text-center">
          <p
            key={insightIdx}
            className="text-sm text-zinc-500 animate-pulse"
          >
            {LIVE_INSIGHTS[insightIdx]}
          </p>
        </div>
      </div>

      {/* Cancel button */}
      <div className="flex justify-end px-6 py-5">
        <button
          onClick={onCancel}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Start over
        </button>
      </div>
    </div>
  );
}
