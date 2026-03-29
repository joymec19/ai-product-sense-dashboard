// lib/context/AnalysisContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { CompetitorData } from "@/lib/types/dashboard";

interface AnalysisContextValue {
  analysisId: string;
  competitors: CompetitorData[];
  analysisTitle: string;
  shareToken: string | null;
  interviewerMode: boolean;
  toggleInterviewerMode: () => void;
  handleShare: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({
  analysisId,
  children,
}: {
  analysisId: string;
  children: React.ReactNode;
}) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [analysisTitle, setAnalysisTitle] = useState("Analysis");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [interviewerMode, setInterviewerMode] = useState(false);

  useEffect(() => {
    setInterviewerMode(localStorage.getItem("interviewerMode") === "true");
  }, []);

  useEffect(() => {
    if (!analysisId) return;

    supabase
      .from("competitors")
      .select("*")
      .eq("analysis_id", analysisId)
      .then(({ data }) => {
        if (data && data.length > 0) setCompetitors(data as CompetitorData[]);
      });

    supabase
      .from("analyses")
      .select("category, share_token")
      .eq("id", analysisId)
      .single()
      .then(({ data }) => {
        if (data) {
          setAnalysisTitle(data.category || "Analysis");
          setShareToken(data.share_token ?? null);
        }
      });
  }, [analysisId]);

  const toggleInterviewerMode = useCallback(() => {
    setInterviewerMode((prev) => {
      const next = !prev;
      localStorage.setItem("interviewerMode", String(next));
      return next;
    });
  }, []);

  const handleShare = useCallback(async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/analysis/${shareToken}/share`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard write failed silently
    }
  }, [shareToken]);

  return (
    <AnalysisContext.Provider
      value={{
        analysisId,
        competitors,
        analysisTitle,
        shareToken,
        interviewerMode,
        toggleInterviewerMode,
        handleShare,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
