"use client";

import { useRef } from "react";
import type { AnalysisConfig } from "@/lib/types/dashboard";

type ContextType = "file" | "questionnaire" | "skip";

interface ProductContextProps {
  value: AnalysisConfig["productContext"];
  onChange: (ctx: AnalysisConfig["productContext"]) => void;
  onNext: () => void;
  onSkip: () => void;
}

const PRICING_OPTIONS = ["Free", "Freemium", "Paid", "Enterprise"] as const;

export default function ProductContext({
  value,
  onChange,
  onNext,
  onSkip,
}: ProductContextProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedType: ContextType = value.type;

  function selectType(type: ContextType) {
    onChange({ type, content: "" });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ type: "file", content: `${file.name}||${reader.result as string}` });
    };
    reader.readAsText(file);
  }

  function handleUrlInput(url: string) {
    onChange({ type: "file", content: `url:${url}` });
  }

  // Questionnaire field helpers
  const q = (() => {
    try {
      return JSON.parse(value.content || "{}");
    } catch {
      return {};
    }
  })();

  function setQ(key: string, val: string) {
    onChange({ type: "questionnaire", content: JSON.stringify({ ...q, [key]: val }) });
  }

  const fileLoaded =
    value.type === "file" && value.content.length > 0;

  const fileName = fileLoaded
    ? value.content.startsWith("url:")
      ? value.content.slice(4)
      : value.content.split("||")[0]
    : "";

  return (
    <div className="space-y-4">
      {/* Option A — File upload */}
      <button
        type="button"
        onClick={() => selectType("file")}
        className={`w-full rounded-xl border p-4 text-left transition-colors ${
          selectedType === "file"
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-600"
        }`}
      >
        <p className="font-semibold text-white">Upload your PRD</p>
        <p className="mt-0.5 text-sm text-zinc-400">
          Accepts .pdf, .txt, .md files (max 5 MB) or paste a Notion URL
        </p>

        {selectedType === "file" && (
          <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-600 p-4 text-center hover:border-indigo-500"
            >
              {fileLoaded ? (
                <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
                  <span>✓</span>
                  <span className="font-medium">{fileName}</span>
                  <span>Context loaded ✓</span>
                </span>
              ) : (
                <span className="text-sm text-zinc-400">
                  Click to browse or drop a file here
                </span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {/* URL input */}
            <input
              type="text"
              placeholder="Or paste a Notion URL…"
              defaultValue={
                value.content.startsWith("url:")
                  ? value.content.slice(4)
                  : ""
              }
              onChange={(e) => handleUrlInput(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </button>

      {/* Option B — Questionnaire (default selected) */}
      <button
        type="button"
        onClick={() => selectType("questionnaire")}
        className={`w-full rounded-xl border p-4 text-left transition-colors ${
          selectedType === "questionnaire"
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-600"
        }`}
      >
        <p className="font-semibold text-white">Answer 5 quick questions</p>
        <p className="mt-0.5 text-sm text-zinc-400">
          Takes ~2 minutes — helps tailor the analysis to your product
        </p>

        {selectedType === "questionnaire" && (
          <div
            className="mt-3 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              rows={2}
              placeholder="Q1: What problem does your product solve?"
              value={q.problem ?? ""}
              onChange={(e) => setQ("problem", e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 resize-none"
            />
            <input
              type="text"
              placeholder="Q2: Who is your primary user persona?"
              value={q.persona ?? ""}
              onChange={(e) => setQ("persona", e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Q3: Top 3 differentiating features (comma-separated)"
              value={q.features ?? ""}
              onChange={(e) => setQ("features", e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
            <select
              value={q.pricing ?? ""}
              onChange={(e) => setQ("pricing", e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">Q4: Pricing model…</option>
              {PRICING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Q5: Competitors you're most concerned about (comma-separated)"
              value={q.competitors ?? ""}
              onChange={(e) => setQ("competitors", e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </button>

      {/* Skip link */}
      <div className="text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip — analyze without product context
        </button>
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
