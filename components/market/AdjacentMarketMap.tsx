// components/market/AdjacentMarketMap.tsx
"use client";

import { useState } from "react";

interface AdjacentMarketMapProps {
  analysisId: string;
  category: string;
  adjacentMarkets: string[];
}

const DEFAULT_MARKETS = [
  "Workflow Automation",
  "Knowledge Management",
  "AI Writing Tools",
  "Project Management",
  "Team Collaboration",
];

// Simple CSS-only bubble map — center + 5 radial positions
const BUBBLE_POSITIONS = [
  { top: "0%", left: "50%", transform: "translate(-50%, 0)" },
  { top: "30%", left: "85%", transform: "translate(-50%, -50%)" },
  { top: "80%", left: "72%", transform: "translate(-50%, -50%)" },
  { top: "80%", left: "28%", transform: "translate(-50%, -50%)" },
  { top: "30%", left: "15%", transform: "translate(-50%, -50%)" },
];

export default function AdjacentMarketMap({
  analysisId,
  category,
  adjacentMarkets,
}: AdjacentMarketMapProps) {
  const [generating, setGenerating] = useState(false);
  const markets = adjacentMarkets.length > 0 ? adjacentMarkets.slice(0, 5) : DEFAULT_MARKETS;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await fetch("/api/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis_id: analysisId, section: "market" }),
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {adjacentMarkets.length === 0 && (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors"
        >
          {generating ? "Generating…" : "Generate adjacent market map"}
        </button>
      )}
      <div className="relative h-64 w-full max-w-md mx-auto">
        {/* SVG lines from center to each bubble */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          {markets.map((_, i) => {
            const pos = BUBBLE_POSITIONS[i];
            const topPct = parseFloat(pos.top) / 100;
            const leftPct = parseFloat(pos.left) / 100;
            return (
              <line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${leftPct * 100}%`}
                y2={`${topPct * 100}%`}
                stroke="#4f46e5"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0.5}
              />
            );
          })}
        </svg>

        {/* Center bubble */}
        <div
          className="absolute rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-xs font-semibold text-white text-center px-2 leading-tight shadow-lg"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 80,
            height: 80,
            zIndex: 10,
          }}
        >
          {category || "Your Category"}
        </div>

        {/* Adjacent market bubbles */}
        {markets.map((market, i) => {
          const pos = BUBBLE_POSITIONS[i];
          return (
            <div
              key={market}
              className="absolute rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-xs text-zinc-300 text-center px-1 leading-tight"
              style={{
                ...pos,
                width: 68,
                height: 68,
                zIndex: 10,
              }}
            >
              {market}
            </div>
          );
        })}
      </div>
    </div>
  );
}
