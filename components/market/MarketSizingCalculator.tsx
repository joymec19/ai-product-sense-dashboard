// components/market/MarketSizingCalculator.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

interface MarketSizingCalculatorProps {
  analysisId: string;
}

function formatDollars(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function MarketSizingCalculator({ analysisId }: MarketSizingCalculatorProps) {
  const { toast } = useToast();
  const [totalUsers, setTotalUsers] = useState(500_000_000);
  const [arpu, setArpu] = useState(120);
  const [capturePercent, setCapturePercent] = useState(0.1);
  const [saving, setSaving] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const tam = totalUsers * arpu;
  const sam = tam * 0.3;
  const som = sam * (capturePercent / 100);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("market_data").upsert(
        {
          analysis_id: analysisId,
          tam,
          sam,
          som,
          assumptions: { total_users: totalUsers, arpu, capture_percent: capturePercent },
        },
        { onConflict: "analysis_id" }
      );
      if (error) {
        toast("Failed to save market data.", "error");
      } else {
        toast("Market sizing saved!", "success");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Total Addressable Users</label>
          <input
            type="number"
            value={totalUsers}
            onChange={(e) => setTotalUsers(Number(e.target.value))}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">ARPU ($/year)</label>
          <input
            type="number"
            value={arpu}
            onChange={(e) => setArpu(Number(e.target.value))}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">
            Market Capture: {capturePercent.toFixed(3)}%
          </label>
          <input
            type="range"
            min={0.001}
            max={5}
            step={0.001}
            value={capturePercent}
            onChange={(e) => setCapturePercent(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      {/* Output metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">TAM</p>
          <p className="text-xl font-bold text-zinc-200">{formatDollars(tam)}</p>
        </div>
        <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">SAM</p>
          <p className="text-xl font-bold text-zinc-200">{formatDollars(sam)}</p>
        </div>
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-4 text-center">
          <p className="text-xs text-indigo-400 mb-1 uppercase tracking-wider">SOM</p>
          <p className="text-2xl font-bold text-indigo-400">{formatDollars(som)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {saving ? "Saving…" : "Save to analysis"}
        </button>
        <button
          onClick={() => setShowFormula((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
        >
          {showFormula ? "Hide" : "How this is calculated"} ▾
        </button>
      </div>

      {showFormula && (
        <div className="rounded-xl bg-zinc-800/40 border border-zinc-700 p-4 text-xs text-zinc-400 space-y-1">
          <p>
            <span className="text-zinc-300 font-medium">TAM</span> = Total Users ×
            ARPU = {totalUsers.toLocaleString()} × ${arpu} = {formatDollars(tam)}
          </p>
          <p>
            <span className="text-zinc-300 font-medium">SAM</span> = TAM × 30%
            (addressable by digital tools) = {formatDollars(sam)}
          </p>
          <p>
            <span className="text-zinc-300 font-medium">SOM</span> = SAM ×{" "}
            {capturePercent.toFixed(3)}% (your market capture) = {formatDollars(som)}
          </p>
        </div>
      )}
    </div>
  );
}
