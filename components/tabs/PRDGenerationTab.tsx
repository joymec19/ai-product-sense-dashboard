// components/tabs/PRDGenerationTab.tsx
"use client";

import { useState } from "react";
import { useAnalysis } from "@/lib/context/AnalysisContext";
import { useAnalysisData } from "@/hooks/useAnalysis";
import PRDEditor from "@/components/prd/PRDEditor";
import { Download, ChevronDown } from "lucide-react";

function TabSkeleton() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="h-8 bg-zinc-800 rounded animate-pulse w-1/4" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/3" />
          <div className="h-6 bg-zinc-800 rounded animate-pulse" />
          <div className="h-6 bg-zinc-800 rounded animate-pulse w-4/5" />
        </div>
      ))}
    </div>
  );
}

export default function PRDGenerationTab() {
  const { analysisId, interviewerMode } = useAnalysis();
  const { loading } = useAnalysisData(analysisId);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (loading) return <TabSkeleton />;

  const handleExportMarkdown = () => {
    setShowExportMenu(false);
    const content = document.querySelector("[data-prd-content]")?.textContent ?? "PRD export";
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-requirements.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    setShowExportMenu(false);
    const content = document.querySelector("[data-prd-content]")?.innerHTML ?? "<p>PRD export</p>";
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>PRD Export</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}h1,h2,h3{color:#1a1a2e}</style></head><body>${content}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-requirements.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setShowExportMenu(false);
    window.print();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Top action bar */}
      {!interviewerMode && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-sm font-medium px-3 py-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3" />
            </button>
            {showExportMenu && (
              <div className="absolute left-0 top-full mt-1 z-20 w-40 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl overflow-hidden">
                {[
                  { label: "Markdown", action: handleExportMarkdown },
                  { label: "HTML", action: handleExportHTML },
                  { label: "PDF (Print)", action: handleExportPDF },
                ].map(({ label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRD Editor — uses its own internal state/fetching */}
      <div data-prd-content className="tab-content-print">
        <PRDEditor analysisId={analysisId} interviewerMode={interviewerMode} />
      </div>
    </div>
  );
}
