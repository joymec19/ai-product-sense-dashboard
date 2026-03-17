// app/analysis/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import PRDEditor from "@/components/prd/PRDEditor";

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Left panel — PRD Editor */}
      <div className="w-1/2 overflow-y-auto border-r border-border p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              PRD Editor
            </h1>
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </a>
          </div>
          <PRDEditor analysisId={params.id} />
        </div>
      </div>

      {/* Right panel — placeholder */}
      <div className="w-1/2 overflow-y-auto p-6">
        {/* TODO: Right panel content — competitive analysis dashboard, export options, etc. */}
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Right panel — coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
