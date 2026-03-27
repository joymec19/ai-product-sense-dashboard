"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import QuestionnaireModal from "@/components/questionnaire/QuestionnaireModal";
import type { Competitor } from "@/lib/schemas/competitor";

type LoadingStage = "idle" | "research" | "prd";

const PROGRESS_VALUES: Record<LoadingStage, number> = {
  idle: 0,
  research: 45,
  prd: 85,
};

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [homeProductContext, setHomeProductContext] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim() || query.trim().length < 2) {
      setError("Please enter a product category (at least 2 characters).");
      return;
    }

    setError(null);
    setLoadingStage("research");

    let analysisId: string;
    let competitors: Competitor[];

    // ── Stage 1: Research ────────────────────────────────────────────────────
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_input: query.trim(),
          ...(homeProductContext && { home_product_context: homeProductContext }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoadingStage("idle");
        return;
      }

      analysisId = data.analysis_id;
      competitors = data.competitors;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoadingStage("idle");
      return;
    }

    // ── Stage 2: PRD generation (only when product context is available) ─────
    if (homeProductContext && homeProductContext.trim().length >= 10) {
      setLoadingStage("prd");
      try {
        await fetch("/api/generate-prd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis_id: analysisId,
            competitors,
            home_product_context: homeProductContext.trim(),
          }),
        });
        // Non-blocking: if PRD generation fails, we still navigate to the analysis
      } catch {
        // Swallow — user can generate PRD from the analysis page
      }
    }

    router.push(`/analysis/${analysisId}`);
  };

  const handleQuestionnaireSubmit = (context: string) => {
    setHomeProductContext(context);
  };

  const loading = loadingStage !== "idle";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-zinc-950" />
      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 -z-10 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #52525b 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
          <div className="flex w-80 flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <p className="text-sm font-medium text-zinc-200">
              {loadingStage === "research"
                ? "Researching competitors..."
                : "Generating PRD sections..."}
            </p>
            <Progress value={PROGRESS_VALUES[loadingStage]} className="w-full" />
            <p className="text-xs text-zinc-500">
              {loadingStage === "research" ? "~15 seconds" : "~30 seconds"}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            AI Product Sense
          </h1>
          <p className="text-zinc-400">
            Competitive analysis and PRD generation, powered by AI
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleAnalyze();
            }}
            placeholder="Describe your product category (e.g. AI scheduling apps for knowledge workers)"
            disabled={loading}
            className="w-full rounded-xl border-zinc-700 bg-zinc-900 px-5 py-4 text-base text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500/30"
          />

          {/* Product context toggle + badge */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestionnaire(true)}
              disabled={loading}
              className="text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
            >
              I don&apos;t have a PRD
            </Button>
            {homeProductContext && (
              <Badge variant="indigo">Product context added</Badge>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 py-3.5 text-base font-semibold text-white hover:bg-indigo-400 focus:ring-indigo-500 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </div>

      {/* Demo card */}
      <div className="w-full max-w-2xl mt-8">
        <div className="border-t border-zinc-800 pt-6">
          <p className="mb-3 text-sm text-zinc-500">
            Or explore a live demo →
          </p>
          <a
            href="/analysis/ai-scheduling-demo-2026/share"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-left transition-colors hover:border-indigo-500 hover:bg-zinc-800/60"
          >
            <p className="font-semibold text-zinc-100">
              AI Scheduling Apps — Smart Scheduler context
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              8 competitors · PRD pre-generated · Read-only
            </p>
          </a>
        </div>
      </div>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        open={showQuestionnaire}
        onOpenChange={setShowQuestionnaire}
        onSubmit={handleQuestionnaireSubmit}
      />
    </div>
  );
}
