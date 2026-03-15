"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Loader2 } from "lucide-react";
import QuestionnaireModal from "@/components/questionnaire/QuestionnaireModal";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

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
        return;
      }

      router.push(`/analysis/${data.analysis_id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireSubmit = (context: string) => {
    setHomeProductContext(context);
  };

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

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-800">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              Analyzing competitive landscape...
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This may take 15–30 seconds
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

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        open={showQuestionnaire}
        onOpenChange={setShowQuestionnaire}
        onSubmit={handleQuestionnaireSubmit}
      />
    </div>
  );
}
