// app/analysis/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import PRDEditor from "@/components/prd/PRDEditor";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RadarChart from "@/components/charts/RadarChart";
import PricingChart from "@/components/charts/PricingChart";
import FeatureMatrix from "@/components/competitors/FeatureMatrix";
import CompetitorCard from "@/components/competitors/CompetitorCard";
import { supabase } from "@/lib/supabase";
import type { CompetitorData } from "@/lib/types/dashboard";
import { Share2, Eye, EyeOff } from "lucide-react";

const BOTTOM_NAV_SECTIONS = ["Overview", "Competitors", "PRD", "GTM"] as const;

function AnalysisPageContent() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [interviewerMode, setInterviewerMode] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [visible, setVisible] = useState(false);
  // Mobile top-level tab: "prd" | "dashboard"
  const [mobileTab, setMobileTab] = useState<"prd" | "dashboard">("prd");

  // Hydrate from localStorage on mount + trigger fade-in
  useEffect(() => {
    setInterviewerMode(localStorage.getItem("interviewerMode") === "true");
    setVisible(true);
  }, []);

  // Fetch competitors from Supabase
  useEffect(() => {
    if (!params.id) return;
    supabase
      .from("competitors")
      .select("*")
      .eq("analysis_id", params.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCompetitors(data as CompetitorData[]);
        }
      });
  }, [params.id]);

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

  // Derive unique feature keys from all competitors' featureSupport maps
  const allFeatures = Array.from(
    new Set(competitors.flatMap((c) => Object.keys(c.featureSupport ?? {})))
  );

  // ── PRD panel (left) ────────────────────────────────────────────────────────
  const prdPanel = (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          PRD Editor
        </h1>
        <div className="flex flex-wrap items-center gap-3">
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
  );

  // ── Dashboard panel (right) ─────────────────────────────────────────────────
  const dashboardPanel = (
    <Tabs defaultValue="competitors">
      <TabsList className="mb-2">
        <TabsTrigger value="competitors">Competitors</TabsTrigger>
        <TabsTrigger value="charts">Charts</TabsTrigger>
        <TabsTrigger value="market">Market</TabsTrigger>
      </TabsList>

      {/* Tab 1: Competitor cards grid */}
      <TabsContent value="competitors">
        {competitors.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-zinc-500">
            No competitor data yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {competitors.map((c) => (
              <CompetitorCard key={c.name} competitor={c} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Tab 2: Stacked charts */}
      <TabsContent value="charts">
        <div className="space-y-6">
          <RadarChart competitors={competitors} />
          <PricingChart competitors={competitors} />
          <FeatureMatrix features={allFeatures} competitors={competitors} />
        </div>
      </TabsContent>

      {/* Tab 3: Market sizing placeholder */}
      <TabsContent value="market">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-zinc-500 italic">TAM/SAM/SOM — Coming in V1.1</p>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div
      className={`bg-zinc-100 dark:bg-zinc-950 min-h-screen transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } ${interviewerMode ? "pb-12" : ""}`}
    >

      {/* ── Mobile tab switcher (hidden on md+) ─────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex gap-2">
        <button
          onClick={() => setMobileTab("prd")}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            mobileTab === "prd"
              ? "bg-zinc-700 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          PRD
        </button>
        <button
          onClick={() => setMobileTab("dashboard")}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            mobileTab === "dashboard"
              ? "bg-zinc-700 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Dashboard
        </button>
      </div>

      {/* ── Mobile: single-column, tab-controlled (<768px) ──────────────────── */}
      <div className="md:hidden p-4">
        {mobileTab === "prd" ? (
          <div id="prd" data-panel="left">
            {prdPanel}
          </div>
        ) : (
          <div id="competitors" data-panel="right">
            {dashboardPanel}
          </div>
        )}
      </div>

      {/* ── Tablet + Desktop: split panels (≥768px) ─────────────────────────── */}
      {/*
        Tablet (768–1023px): 50/50 split
        Desktop (≥1024px):   40/60 split
        Both panels scroll independently (h-screen overflow-y-auto)
      */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left: PRD Editor — 50% tablet, 40% desktop */}
        <div
          id="prd"
          className="w-1/2 lg:w-[40%] h-full overflow-y-auto border-r border-border p-6"
          data-panel="left"
        >
          {prdPanel}
        </div>

        {/* Right: Dashboard — 50% tablet, 60% desktop */}
        <div
          id="competitors"
          className="w-1/2 lg:w-[60%] h-full overflow-y-auto p-6"
          data-panel="right"
        >
          {dashboardPanel}
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
