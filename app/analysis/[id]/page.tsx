// app/analysis/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import PRDEditor from "@/components/prd/PRDEditor";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { Share2, Eye, EyeOff } from "lucide-react";

const BOTTOM_NAV_SECTIONS = ["Overview", "Competitors", "PRD", "GTM"] as const;

function AnalysisPageContent() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [interviewerMode, setInterviewerMode] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setInterviewerMode(localStorage.getItem("interviewerMode") === "true");
  }, []);

  const toggleInterviewerMode = () => {
    setInterviewerMode((prev) => {
      const next = !prev;
      localStorage.setItem("interviewerMode", String(next));
      return next;
    });
  };

  const handleShare = async () => {
    const { data } = await supabase
      .from("analyses")
      .select("share_token")
      .eq("id", params.id)
      .single();

    if (data?.share_token) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/analysis/${data.share_token}/share`
      );
      toast("Share link copied!", "success");
    } else {
      toast("Could not retrieve share link.", "error");
    }
  };

  const scrollToSection = (section: string) => {
    document.getElementById(section.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`flex min-h-screen bg-zinc-100 dark:bg-zinc-900 ${interviewerMode ? "pb-12" : ""}`}>
      {/* Left panel — PRD Editor */}
      <div
        id="prd"
        className="w-1/2 overflow-y-auto border-r border-border p-6"
        data-panel="left"
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              PRD Editor
            </h1>
            <div className="flex items-center gap-3">
              {/* Interviewer Mode toggle */}
              <button
                onClick={toggleInterviewerMode}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  interviewerMode
                    ? "text-indigo-500 hover:text-indigo-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={interviewerMode ? "Interviewer Mode ON" : "Interviewer Mode OFF"}
              >
                {interviewerMode ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                Interviewer Mode
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                title="Copy share link"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>

              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </a>
            </div>
          </div>

          {/* Overview anchor */}
          <div id="overview" />

          <PRDEditor analysisId={params.id} interviewerMode={interviewerMode} />
        </div>
      </div>

      {/* Right panel — placeholder */}
      <div
        id="competitors"
        className="w-1/2 overflow-y-auto p-6"
        data-panel="right"
      >
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Right panel — coming soon
          </p>
        </div>
      </div>

      {/* GTM anchor (bottom of page) */}
      <div id="gtm" />

      {/* Bottom nav — Interviewer Mode only */}
      {interviewerMode && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-8 border-t border-border bg-background py-3">
          {BOTTOM_NAV_SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {section}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <ToastProvider>
      <AnalysisPageContent />
    </ToastProvider>
  );
}
