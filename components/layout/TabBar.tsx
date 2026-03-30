// components/layout/TabBar.tsx
"use client";

import { cn } from "@/lib/utils";

export const TABS = [
  { value: "competitive", label: "⚔️ Competitive Analysis" },
  { value: "prd",         label: "📋 PRD Generation" },
  { value: "market",      label: "📊 Market Intelligence" },
  { value: "gtm",         label: "🚀 GTM & Strategy" },
  { value: "portfolio",   label: "🎯 Portfolio" },
  { value: "assistant",   label: "🤖 AI Assistant" },
] as const;

export type TabValue = (typeof TABS)[number]["value"];

interface TabBarProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tab-bar flex-shrink-0 h-12 bg-zinc-900 border-b border-zinc-800 flex items-end overflow-x-auto scrollbar-none px-2">
      {TABS.map(({ value, label }) => {
        const isActive = activeTab === value;
        return (
          <button
            key={value}
            onClick={() => onTabChange(value)}
            className={cn(
              "flex-shrink-0 h-full px-4 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
              isActive
                ? "border-indigo-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
