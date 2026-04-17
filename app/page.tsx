"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, ChevronDown } from "lucide-react";
import CategoryInput from "@/components/configure/CategoryInput";
import ProductContext from "@/components/configure/ProductContext";
import AnalysisSettings from "@/components/configure/AnalysisSettings";
import LaunchPanel from "@/components/configure/LaunchPanel";
import AnalysisProgress from "@/components/configure/AnalysisProgress";
import type { AnalysisConfig } from "@/lib/types/dashboard";
import type { Competitor } from "@/lib/schemas/competitor";

type LoadingStage = "idle" | "research" | "analysis" | "prd";

type ConfigState = AnalysisConfig & {
  currentStep: 1 | 2 | 3 | 4;
  loadingStage: LoadingStage;
};

const INITIAL_STATE: ConfigState = {
  category: "",
  disambiguated: "",
  productContext: { type: "questionnaire", content: "" },
  geography: [],
  segment: [],
  customCompetitors: [],
  currentStep: 1,
  loadingStage: "idle",
};

const STEP_TITLES = [
  "What are you analyzing?",
  "Tell us about your product",
  "Customize your analysis",
  "Review & Launch",
] as const;

interface StepPanelProps {
  stepNumber: 1 | 2 | 3 | 4;
  title: string;
  currentStep: 1 | 2 | 3 | 4;
  onHeaderClick: () => void;
  children: React.ReactNode;
}

function StepPanel({
  stepNumber,
  title,
  currentStep,
  onHeaderClick,
  children,
}: StepPanelProps) {
  const isOpen = currentStep === stepNumber;
  const isDone = currentStep > stepNumber;
  const isLocked = currentStep < stepNumber;

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        isOpen
          ? "border-indigo-500/60 bg-zinc-900"
          : isDone
          ? "border-zinc-700 bg-zinc-900/50"
          : "border-zinc-800 bg-zinc-900/30 opacity-50"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onHeaderClick}
        disabled={isLocked}
        className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-default"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isDone
              ? "bg-emerald-500 text-white"
              : isOpen
              ? "bg-indigo-500 text-white"
              : "border border-zinc-600 text-zinc-500"
          }`}
        >
          {isDone ? "✓" : stepNumber}
        </span>

        <span
          className={`flex-1 text-sm font-semibold ${
            isLocked ? "text-zinc-600" : "text-zinc-100"
          }`}
        >
          {title}
        </span>

        {!isLocked && (
          <ChevronDown
            className={`h-4 w-4 text-zinc-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800 px-5 py-5">{children}</div>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfigState>(INITIAL_STATE);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  function patch(partial: Partial<ConfigState>) {
    setConfig((prev) => ({ ...prev, ...partial }));
  }

  function goToStep(step: 1 | 2 | 3 | 4) {
    if (step <= config.currentStep) {
      patch({ currentStep: step });
    }
  }

  const handleAnalyze = async () => {
    if (!config.category.trim()) return;

    setError(null);
    patch({ loadingStage: "research" });

    let analysisId: string;
    let competitors: Competitor[];

    // Build product context string for the API
    let homeProductContext: string | null = null;
    if (config.productContext.type === "questionnaire" && config.productContext.content) {
      homeProductContext = config.productContext.content;
    } else if (config.productContext.type === "file" && config.productContext.content) {
      homeProductContext = config.productContext.content.includes("||")
        ? (config.productContext.content.split("||")[1] ?? config.productContext.content)
        : config.productContext.content;
    }

    // Stage 1: Research
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_input: config.category.trim(),
          ...(homeProductContext && { home_product_context: homeProductContext }),
          market_scope: {
            geography: config.geography,
            segment: config.segment,
            custom_competitors: config.customCompetitors,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        patch({ loadingStage: "idle" });
        return;
      }

      analysisId = data.session_id ?? data.analysis_id;
      competitors = data.competitors;
    } catch {
      setError("Network error. Please check your connection and try again.");
      patch({ loadingStage: "idle" });
      return;
    }

    // Stage 2: visual analysis step
    patch({ loadingStage: "analysis" });
    await new Promise<void>((r) => setTimeout(r, 800));

    // Stage 3: PRD generation
    if (homeProductContext && homeProductContext.trim().length >= 10) {
      patch({ loadingStage: "prd" });
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
      } catch {
        // Non-blocking
      }
    }

    router.push(`/analysis/${analysisId}/competitive`);
  };

  const isLoading = config.loadingStage !== "idle";

  if (isLoading) {
    return (
      <AnalysisProgress
        stage={config.loadingStage}
        onCancel={() => patch({ loadingStage: "idle" })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      {/* Dark/light toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed right-4 top-4 z-50 rounded-full bg-zinc-800 p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="mx-auto max-w-3xl space-y-3">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            AI Product Sense
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Competitive analysis and PRD generation, powered by AI
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Step 1 */}
        <StepPanel
          stepNumber={1}
          title={STEP_TITLES[0]}
          currentStep={config.currentStep}
          onHeaderClick={() => goToStep(1)}
        >
          <CategoryInput
            value={config.category}
            disambiguated={config.disambiguated}
            onChange={(value, disambiguated) =>
              patch({ category: value, disambiguated })
            }
            onNext={() => {
              if (config.category.trim().length >= 2) patch({ currentStep: 2 });
            }}
          />
        </StepPanel>

        {/* Step 2 */}
        <StepPanel
          stepNumber={2}
          title={STEP_TITLES[1]}
          currentStep={config.currentStep}
          onHeaderClick={() => goToStep(2)}
        >
          <ProductContext
            value={config.productContext}
            onChange={(ctx) => patch({ productContext: ctx })}
            onNext={() => patch({ currentStep: 3 })}
            onSkip={() =>
              patch({
                productContext: { type: "skip", content: "" },
                currentStep: 3,
              })
            }
          />
        </StepPanel>

        {/* Step 3 */}
        <StepPanel
          stepNumber={3}
          title={STEP_TITLES[2]}
          currentStep={config.currentStep}
          onHeaderClick={() => goToStep(3)}
        >
          <AnalysisSettings
            geography={config.geography}
            segment={config.segment}
            customCompetitors={config.customCompetitors}
            onChangeGeo={(geo) => patch({ geography: geo })}
            onChangeSegment={(seg) => patch({ segment: seg })}
            onChangeCompetitors={(comps) => patch({ customCompetitors: comps })}
            onNext={() => patch({ currentStep: 4 })}
          />
        </StepPanel>

        {/* Step 4 */}
        <StepPanel
          stepNumber={4}
          title={STEP_TITLES[3]}
          currentStep={config.currentStep}
          onHeaderClick={() => goToStep(4)}
        >
          <LaunchPanel
            config={config}
            onLaunch={handleAnalyze}
            loading={isLoading}
          />
        </StepPanel>
      </div>
    </div>
  );
}
