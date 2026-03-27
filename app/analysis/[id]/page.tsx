// app/analysis/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import PRDEditor from "@/components/prd/PRDEditor";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import RadarChart from "@/components/charts/RadarChart";
import PricingChart from "@/components/charts/PricingChart";
import FeatureMatrix from "@/components/competitors/FeatureMatrix";
import CompetitorCard from "@/components/competitors/CompetitorCard";
import { supabase } from "@/lib/supabase";
import type { CompetitorData } from "@/lib/types/dashboard";
import { Share2, Eye, EyeOff, ArrowLeft } from "lucide-react";

const BOTTOM_NAV_SECTIONS = ["Overview", "Competitors", "PRD", "GTM"] as const;

function AnalysisPageContent() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [interviewerMode, setInterviewerMode] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [visible, setVisible] = useState(false);

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

  // ── PRD panel content ───────────────────────────────────────────────────────
  const prdPanel = (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight text-white">
          PRD Editor
        </h1>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleInterviewerMode}
            className={`flex items-center gap-1.5 text-sm ${
              interviewerMode
                ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title={interviewerMode ? "Interviewer Mode ON" : "Interviewer Mode OFF"}
          >
            {interviewerMode ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            Interviewer Mode
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200"
            title="Copy share link"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <a
            href="/"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "text-sm text-zinc-400 hover:text-zinc-200" })}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </a>
        </div>
      </div>

      <div id="overview" />
      <PRDEditor analysisId={params.id} interviewerMode={interviewerMode} />
    </div>
  );

  // ── Dashboard panel content ─────────────────────────────────────────────────
  const dashboardPanel = (
    <Tabs defaultValue="competitors">
      <TabsList className="mb-4">
        <TabsTrigger value="competitors">Competitors</TabsTrigger>
        <TabsTrigger value="charts">Charts</TabsTrigger>
        <TabsTrigger value="market">Market</TabsTrigger>
      </TabsList>

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

      <TabsContent value="charts">
        <div className="space-y-6">
          <RadarChart competitors={competitors} />
          <PricingChart competitors={competitors} />
          <FeatureMatrix features={allFeatures} competitors={competitors} />
        </div>
      </TabsContent>

      <TabsContent value="market">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-zinc-500 italic">TAM/SAM/SOM — Coming in V1.1</p>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div
      className={`bg-zinc-950 min-h-screen transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } ${interviewerMode ? "pb-12" : ""}`}
    >

      {/* ── Mobile view (hidden on md+) — Tabs control which panel is shown ─── */}
      <div className="md:hidden">
        <Tabs defaultValue="prd" className="w-full">
          {/* Sticky tab switcher bar */}
          <div className="sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800 px-4 py-2">
            <TabsList className="w-full">
              <TabsTrigger value="prd" className="flex-1">PRD</TabsTrigger>
              <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="prd">
            <div className="p-4" id="prd" data-panel="left">
              {prdPanel}
            </div>
          </TabsContent>
          <TabsContent value="dashboard">
            <div className="p-4" id="competitors" data-panel="right">
              {dashboardPanel}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Tablet + Desktop: split panels (≥768px) ─────────────────────────── */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left: PRD Editor — 50% tablet, 40% desktop */}
        <div
          id="prd"
          className="w-1/2 lg:w-[40%] h-full overflow-y-auto border-r border-zinc-800 p-6"
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

      {/* GTM anchor */}
      <div id="gtm" />

      {/* Bottom nav — Interviewer Mode only */}
      {interviewerMode && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-8 border-t border-zinc-800 bg-zinc-950 py-3">
          {BOTTOM_NAV_SECTIONS.map((section) => (
            <Button
              key={section}
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection(section)}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              {section}
            </Button>
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
