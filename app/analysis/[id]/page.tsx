// app/analysis/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnalysisProvider } from "@/lib/context/AnalysisContext";
import { InterviewerModeProvider, useInterviewerMode } from "@/context/InterviewerModeContext";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import AnalysisNav from "@/components/layout/AnalysisNav";
import TabBar, { type TabValue } from "@/components/layout/TabBar";

// Tab components
import CompetitiveAnalysisTab from "@/components/tabs/CompetitiveAnalysisTab";
import PRDGenerationTab from "@/components/tabs/PRDGenerationTab";
import MarketIntelligenceTab from "@/components/tabs/MarketIntelligenceTab";
import GTMStrategyTab from "@/components/tabs/GTMStrategyTab";
import PortfolioTab from "@/components/tabs/PortfolioTab";
import AIAssistantTab from "@/components/tabs/AIAssistantTab";

const BOTTOM_NAV = [
  { label: "Overview",    tab: "competitive" },
  { label: "Competitors", tab: "competitive" },
  { label: "PRD",         tab: "prd" },
  { label: "Market",      tab: "market" },
  { label: "GTM",         tab: "gtm" },
  { label: "Portfolio",   tab: "portfolio" },
] as const;

function AnalysisPageContent() {
  const [activeTab, setActiveTab] = useState<TabValue>("competitive");
  const [visitedTabs, setVisitedTabs] = useState<Set<TabValue>>(() => new Set<TabValue>(["competitive"]));
  const { interviewerMode } = useInterviewerMode();

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => { const next = new Set<TabValue>(prev); next.add(tab); return next; });
  };

  return (
    <div className="bg-zinc-950 flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* ── Fixed top nav bar ────────────────────────────────────────────────── */}
      <AnalysisNav />

      {/* ── Tabs — controlled ───────────────────────────────────────────────── */}
      <Tabs
        defaultValue="competitive"
        value={activeTab}
        onValueChange={(v) => handleTabChange(v as TabValue)}
        className="flex flex-col flex-1 min-h-0"
      >
        {/* ── Horizontal tab bar ───────────────────────────────────────────── */}
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          visitedTabs={visitedTabs}
          interviewerMode={interviewerMode}
        />

        {/* ── Tab content area — remaining viewport height, scrollable ─────── */}
        <div className={cn("flex-1 min-h-0 overflow-hidden", interviewerMode && "pb-12")}>
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

      {/* ── FAB: open AI Assistant tab (hidden in interviewer mode) ──────────── */}
      {!interviewerMode && activeTab !== "assistant" && (
        <button
          onClick={() => handleTabChange("assistant")}
          title="Open AI Assistant"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <Bot className="h-5 w-5 text-white" />
        </button>
      )}

      {/* ── Bottom fixed nav (interviewer mode only) ─────────────────────────── */}
      {interviewerMode && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-zinc-900 border-t border-zinc-700 flex justify-around items-center h-12 text-xs font-medium">
          {BOTTOM_NAV.map(({ label, tab }) => (
            <button
              key={label}
              onClick={() => handleTabChange(tab as TabValue)}
              className={cn(
                "px-3 py-2 transition-colors",
                activeTab === tab ? "text-indigo-400" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();

  return (
    <InterviewerModeProvider>
      <ToastProvider>
        <AnalysisProvider analysisId={params.id}>
          <AnalysisPageContent />
        </AnalysisProvider>
      </ToastProvider>
    </InterviewerModeProvider>
  );
}
