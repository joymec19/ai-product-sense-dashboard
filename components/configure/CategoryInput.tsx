"use client";

import { useState, useEffect } from "react";

const DISAMBIGUATION_RULES: Array<{ keyword: string; label: string }> = [
  { keyword: "scheduling", label: "task/calendar AI tools" },
  { keyword: "chat", label: "conversational AI assistants" },
  { keyword: "analytics", label: "product analytics platforms" },
];

function disambiguate(input: string): string {
  const lower = input.toLowerCase();
  for (const rule of DISAMBIGUATION_RULES) {
    if (lower.includes(rule.keyword)) return rule.label;
  }
  return "AI-powered software tools";
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface CategoryInputProps {
  value: string;
  disambiguated: string;
  onChange: (value: string, disambiguated: string) => void;
  onNext: () => void;
}

export default function CategoryInput({
  value,
  disambiguated,
  onChange,
  onNext,
}: CategoryInputProps) {
  const [showChip, setShowChip] = useState(false);

  useEffect(() => {
    setShowChip(wordCount(value) >= 3);
    if (wordCount(value) >= 3) {
      onChange(value, disambiguate(value));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, disambiguate(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim().length >= 2) onNext();
        }}
        placeholder="Describe your product category (e.g. AI scheduling apps for knowledge workers)"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-4 text-base text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        autoFocus
      />

      {showChip && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-sm text-indigo-400">
            <span className="text-indigo-300">We&apos;ll focus on:</span>
            <span className="font-medium">{disambiguated}</span>
          </span>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={value.trim().length < 2}
        className="w-full rounded-xl bg-indigo-500 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
