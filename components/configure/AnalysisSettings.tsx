"use client";

import { useState } from "react";

const GEO_OPTIONS = ["Global", "India", "US", "Europe", "APAC"] as const;
const SEGMENT_OPTIONS = ["B2C", "B2B", "SMB", "Enterprise"] as const;
const MAX_CUSTOM = 5;

interface AnalysisSettingsProps {
  geography: string[];
  segment: string[];
  customCompetitors: string[];
  onChangeGeo: (geo: string[]) => void;
  onChangeSegment: (seg: string[]) => void;
  onChangeCompetitors: (comps: string[]) => void;
  onNext: () => void;
}

function PillToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-500 text-white"
          : "border border-zinc-600 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

function toggle(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function AnalysisSettings({
  geography,
  segment,
  customCompetitors,
  onChangeGeo,
  onChangeSegment,
  onChangeCompetitors,
  onNext,
}: AnalysisSettingsProps) {
  const [competitorInput, setCompetitorInput] = useState("");

  function addCompetitor() {
    const trimmed = competitorInput.trim();
    if (!trimmed) return;
    if (customCompetitors.length >= MAX_CUSTOM) return;
    if (customCompetitors.includes(trimmed)) return;
    onChangeCompetitors([...customCompetitors, trimmed]);
    setCompetitorInput("");
  }

  function removeCompetitor(name: string) {
    onChangeCompetitors(customCompetitors.filter((c) => c !== name));
  }

  return (
    <div className="space-y-6">
      {/* Group A: Geography */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
          Geography
        </p>
        <div className="flex flex-wrap gap-2">
          {GEO_OPTIONS.map((g) => (
            <PillToggle
              key={g}
              label={g}
              active={geography.includes(g)}
              onClick={() => onChangeGeo(toggle(geography, g))}
            />
          ))}
        </div>
      </div>

      {/* Group B: Target Segment */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
          Target Segment
        </p>
        <div className="flex flex-wrap gap-2">
          {SEGMENT_OPTIONS.map((s) => (
            <PillToggle
              key={s}
              label={s}
              active={segment.includes(s)}
              onClick={() => onChangeSegment(toggle(segment, s))}
            />
          ))}
        </div>
      </div>

      {/* Group C: Competitors */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
          Competitors
        </p>

        {customCompetitors.length === 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700/60 px-3 py-1 text-xs text-zinc-400">
            AI will auto-select 6–10 competitors
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={competitorInput}
            onChange={(e) => setCompetitorInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCompetitor();
            }}
            placeholder="+ Add specific competitor"
            disabled={customCompetitors.length >= MAX_CUSTOM}
            className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 disabled:opacity-40"
          />
          <button
            type="button"
            onClick={addCompetitor}
            disabled={
              !competitorInput.trim() ||
              customCompetitors.length >= MAX_CUSTOM
            }
            className="rounded-lg bg-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-600 disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </div>

        {customCompetitors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {customCompetitors.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-sm text-indigo-300"
              >
                {c}
                <button
                  type="button"
                  onClick={() => removeCompetitor(c)}
                  className="text-indigo-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {customCompetitors.length >= MAX_CUSTOM && (
          <p className="text-xs text-zinc-500">
            Maximum {MAX_CUSTOM} custom competitors
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-xl bg-indigo-500 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-400"
      >
        Next →
      </button>
    </div>
  );
}
