// app/analysis/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnalysisProvider, useAnalysis } from "@/lib/context/AnalysisContext";
import { Eye, EyeOff, Share2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

// Tab components
import CompetitiveAnalysisTab from "@/components/tabs/CompetitiveAnalysisTab";
import PRDGenerationTab from "@/components/tabs/PRDGenerationTab";
import MarketIntelligenceTab from "@/components/tabs/MarketIntelligenceTab";
import GTMStrategyTab from "@/components/tabs/GTMStrategyTab";
import PortfolioTab from "@/components/tabs/PortfolioTab";
import AIAssistantTab from "@/components/tabs/AIAssistantTab";

const TABS = [
  { value: "competitive", label: "⚔️ Competitive Analysis" },
  { value: "prd", label: "📋 PRD Generation" },
  { value: "market", label: "📊 Market Intelligence" },
  { value: "gtm", label: "🚀 GTM & Strategy" },
  { value: "portfolio", label: "🎯 Portfolio" },
  { value: "assistant", label: "🤖 AI Assistant" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function AnalysisPageContent() {
  const { analysisTitle, interviewerMode, toggleInterviewerMode, handleShare } = useAnalysis();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabValue>("competitive");

  const onShare = async () => {
    await handleShare();
    toast("Share link copied!", "success");
  };

  return (
    <div className="bg-zinc-950 flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* ── Fixed top nav bar — 56px ─────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-3">
        {/* Left: App name */}
        <span className="text-sm font-bold text-indigo-400 whitespace-nowrap">
          ProductSense AI
        </span>

        {/* Center: Analysis title */}
        <div className="flex-1 min-w-0 flex justify-center">
          <span className="text-sm font-medium text-zinc-200 truncate max-w-xs md:max-w-md">
            {analysisTitle}
          </span>
        </div>

        {/* Right: actions */}
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

          <a
            href="/"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            ←<span className="hidden sm:inline ml-1">Back</span>
          </a>
        </div>
      </header>

      {/* ── Tabs — controlled ───────────────────────────────────────────────── */}
      {/*
        We use Tabs in controlled mode (value + onValueChange) for the content switching,
        but render our own tab bar buttons so we can fully control the active indicator style.
        TabsContent reads `active` from context which equals `activeTab`.
      */}
      <Tabs
        defaultValue="competitive"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex flex-col flex-1 min-h-0"
      >
        {/* ── Horizontal tab bar — sticky below nav, full-width ─────────────── */}
        <div className="flex-shrink-0 h-12 bg-zinc-900 border-b border-zinc-800 flex items-end overflow-x-auto scrollbar-none px-2">
          {TABS.map(({ value, label }) => {
            const isActive = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={cn(
                  "flex-shrink-0 h-full px-4 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content area — remaining viewport height, scrollable ─────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="competitive" className="h-full overflow-y-auto mt-0">
            <CompetitiveAnalysisTab />
          </TabsContent>

          <TabsContent value="prd" className="h-full overflow-y-auto mt-0">
            <PRDGenerationTab />
          </TabsContent>

          <TabsContent value="market" className="h-full overflow-y-auto mt-0">
            <MarketIntelligenceTab />
          </TabsContent>

          <TabsContent value="gtm" className="h-full overflow-y-auto mt-0">
            <GTMStrategyTab />
          </TabsContent>

          <TabsContent value="portfolio" className="h-full overflow-y-auto mt-0">
            <PortfolioTab />
          </TabsContent>

          {/* AI Assistant: flex layout fills remaining height for chat */}
          <TabsContent value="assistant" className="h-full mt-0 flex flex-col overflow-hidden">
            <AIAssistantTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* ── FAB: open AI Assistant tab ───────────────────────────────────────── */}
      {activeTab !== "assistant" && (
        <button
          onClick={() => setActiveTab("assistant")}
          title="Open AI Assistant"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <Bot className="h-5 w-5 text-white" />
        </button>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();

  return (
    <ToastProvider>
      <AnalysisProvider analysisId={params.id}>
        <AnalysisPageContent />
      </AnalysisProvider>
    </ToastProvider>
  );
}
