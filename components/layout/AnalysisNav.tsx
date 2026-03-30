// components/layout/AnalysisNav.tsx
"use client";

import Link from "next/link";
import { Eye, EyeOff, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalysis } from "@/lib/context/AnalysisContext";
import { useToast } from "@/components/ui/toast";

export default function AnalysisNav() {
  const { analysisTitle, interviewerMode, toggleInterviewerMode, handleShare } =
    useAnalysis();
  const { toast } = useToast();

  const onShare = async () => {
    await handleShare();
    toast("Share link copied!", "success");
  };

  return (
    <header className="analysis-nav flex-shrink-0 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 gap-3">
      {/* Left: Wordmark */}
      <Link
        href="/"
        className="text-sm font-bold text-indigo-400 whitespace-nowrap hover:text-indigo-300 transition-colors"
      >
        AI Product Sense
      </Link>

      {/* Center: Analysis title */}
      <div className="flex-1 min-w-0 flex justify-center">
        <span className="text-sm font-medium text-zinc-200 truncate max-w-xs md:max-w-md">
          {analysisTitle}
        </span>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={toggleInterviewerMode}
          title={interviewerMode ? "Interviewer Mode ON" : "Interviewer Mode OFF"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            interviewerMode
              ? "bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          )}
        >
          {interviewerMode ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Interviewer Mode</span>
        </button>

        <button
          onClick={onShare}
          title="Copy share link"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          ←<span className="hidden sm:inline ml-1">Back</span>
        </Link>
      </div>
    </header>
  );
}
