"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import QuestionnaireModal from "@/components/questionnaire/QuestionnaireModal";
import type { Competitor } from "@/lib/schemas/competitor";

type LoadingStage = "idle" | "research" | "prd";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [homeProductContext, setHomeProductContext] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 transition-colors">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-zinc-100 transition-colors dark:bg-zinc-900" />

      {/* Dark/Light mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed right-4 top-4 z-50 rounded-full bg-zinc-200 p-2.5 text-zinc-600 transition-colors hover:bg-zinc-300 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Staged loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
          <div className="flex w-80 flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-800">
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {loadingStage === "research"
                ? "Researching competitors..."
                : "Generating PRD sections..."}
            </p>
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                key={loadingStage}
                className={`h-full rounded-full bg-indigo-500 ${
                  loadingStage === "research"
                    ? "animate-progress-research"
                    : "animate-progress-prd"
                }`}
              />
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {loadingStage === "research" ? "~15 seconds" : "~30 seconds"}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 transition-colors dark:text-white">
            AI Product Sense
          </h1>
          <p className="text-zinc-500 transition-colors dark:text-zinc-400">
            Competitive analysis and PRD generation, powered by AI
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleAnalyze();
            }}
            placeholder="Describe your product category (e.g. AI scheduling apps for knowledge workers)"
            className="w-full rounded-xl border border-zinc-300 bg-white px-5 py-4 text-base text-zinc-900 placeholder-zinc-500 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
            disabled={loading}
          />

          {/* "I don't have a PRD" toggle */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="text-sm text-indigo-500 underline-offset-2 transition-colors hover:text-indigo-400 hover:underline"
              disabled={loading}
            >
              I don&apos;t have a PRD
            </button>
            {homeProductContext && (
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500">
                Product context added
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-900"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {/* Demo card */}
      <div className="w-full max-w-2xl mt-8">
        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Or explore a live demo →
          </p>
          <a
            href="/analysis/ai-scheduling-demo-2026/share"
            className="block rounded-xl border border-zinc-200 bg-white px-5 py-4 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-500 dark:hover:bg-zinc-700/80"
          >
            <p className="font-semibold text-zinc-900 dark:text-white">
              AI Scheduling Apps — Smart Scheduler context
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
