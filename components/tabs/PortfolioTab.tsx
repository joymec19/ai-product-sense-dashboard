// components/tabs/PortfolioTab.tsx
"use client";

import { useState, useEffect } from "react";
import { useAnalysis } from "@/lib/context/AnalysisContext";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Copy, Check, Plus, Code } from "lucide-react";
import { useToast } from "@/components/ui/toast";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface Annotation {
  id: string;
  section: string;
  content: string;
}

interface PRDVersion {
  id: string;
  version: number;
  updated_at: string;
}

export default function PortfolioTab() {
  const { analysisId, shareToken, interviewerMode, toggleInterviewerMode } = useAnalysis();
  const { toast } = useToast();
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteSection, setNoteSection] = useState("General");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [versions, setVersions] = useState<PRDVersion[]>([]);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/analysis/${shareToken}/share`
    : "";

  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" title="Competitive Analysis"></iframe>`;

  useEffect(() => {
    if (!analysisId) return;
    supabase
      .from("annotations")
      .select("id, section, content")
      .eq("analysis_id", analysisId)
      .then(({ data }) => {
        if (data) setAnnotations(data as Annotation[]);
      });
    supabase
      .from("prd_documents")
      .select("id, version, updated_at")
      .eq("analysis_id", analysisId)
      .order("version", { ascending: false })
      .then(({ data }) => {
        if (data) setVersions(data as PRDVersion[]);
      });
  }, [analysisId]);

  const handleCopyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 1500);
      toast("Share link copied!", "success");
    });
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 1500);
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const { data, error } = await supabase
      .from("annotations")
      .insert({ analysis_id: analysisId, section: noteSection, content: newNote.trim() })
      .select("id, section, content")
      .single();
    if (!error && data) {
      setAnnotations((prev) => [...prev, data as Annotation]);
      setNewNote("");
      setShowNoteForm(false);
      toast("Note added!", "success");
    }
  };

  const handleExportSlides = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Product Deck</title>
<style>
  @media print {
    .slide { page-break-after: always; }
  }
  body { margin: 0; font-family: sans-serif; background: #09090b; color: #f4f4f5; }
  .slide { width: 100vw; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; box-sizing: border-box; border-bottom: 1px solid #27272a; }
  h1 { font-size: 2.5rem; margin-bottom: 1rem; }
  h2 { font-size: 1.5rem; color: #818cf8; margin-bottom: 0.5rem; }
  p { color: #a1a1aa; font-size: 1.1rem; max-width: 700px; text-align: center; }
</style>
</head>
<body>
  <div class="slide"><h2>Slide 1 — Problem &amp; Market Size</h2><h1>The Problem</h1><p>Product managers spend 40% of their time on competitive research and documentation that could be automated with AI.</p></div>
  <div class="slide"><h2>Slide 2 — Competitive Landscape</h2><h1>Competitor Radar</h1><p>See full analysis at ${shareUrl}</p></div>
  <div class="slide"><h2>Slide 3 — Market Positioning</h2><h1>How We Win</h1><p>We occupy the high-intelligence + high-simplicity quadrant no current competitor owns.</p></div>
  <div class="slide"><h2>Slide 4 — PRD Summary</h2><h1>Top P1 Features</h1><p>AI-Powered Research · PRD Generation · GTM Strategy Builder</p></div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-deck.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* E1 — Portfolio Share Link */}
      <SectionCard title="Share Link">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl || "No share token — run analysis first"}
              className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-2 outline-none truncate"
            />
            <button
              onClick={handleCopyShare}
              disabled={!shareUrl}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm px-3 py-2 transition-colors"
            >
              {copiedShare ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedShare ? "Copied" : "Copy"}
            </button>
          </div>
          {/* QR Code placeholder */}
          <div className="w-28 h-28 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-600 font-medium">
            QR Code
          </div>
        </div>
      </SectionCard>

      {/* E2 — Interviewer Mode */}
      <SectionCard title="Interviewer Mode">
        <div
          className={`rounded-xl border p-5 flex items-start gap-4 cursor-pointer transition-all ${
            interviewerMode
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-600"
          }`}
          onClick={toggleInterviewerMode}
        >
          <div className="flex-shrink-0 rounded-xl bg-zinc-700 p-2.5">
            {interviewerMode ? (
              <Eye className="h-5 w-5 text-indigo-400" />
            ) : (
              <EyeOff className="h-5 w-5 text-zinc-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-200">Interviewer Mode</span>
              <span
                className={`rounded-full text-xs px-2 py-0.5 font-medium ${
                  interviewerMode
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-zinc-700 text-zinc-400"
                }`}
              >
                {interviewerMode ? "ON" : "OFF"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Strips edit UI. Adds guided tooltips. Optimized for screen-share.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* E3 — Narrative Export */}
      <SectionCard title="Narrative Export">
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            Export a structured HTML slide deck with problem, competitive analysis, positioning map,
            and PRD summary.
          </p>
          <button
            onClick={handleExportSlides}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Export as Slide Deck
          </button>
        </div>
      </SectionCard>

      {/* E4 — Annotation Layer */}
      <SectionCard title="Annotations">
        <div className="space-y-3">
          {annotations.map((a) => (
            <div
              key={a.id}
              className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3"
            >
              <p className="text-xs text-yellow-400 font-medium mb-1">{a.section}</p>
              <p className="text-sm text-zinc-200">{a.content}</p>
            </div>
          ))}
          {showNoteForm ? (
            <div className="rounded-xl bg-zinc-800 border border-zinc-700 p-4 space-y-3">
              <input
                value={noteSection}
                onChange={(e) => setNoteSection(e.target.value)}
                placeholder="Section name"
                className="w-full rounded-lg bg-zinc-700 border border-zinc-600 text-zinc-200 text-sm px-3 py-2 outline-none"
              />
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Your note…"
                rows={3}
                className="w-full rounded-lg bg-zinc-700 border border-zinc-600 text-zinc-200 text-sm px-3 py-2 outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 transition-colors"
                >
                  Save Note
                </button>
                <button
                  onClick={() => setShowNoteForm(false)}
                  className="rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs px-3 py-1.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNoteForm(true)}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Note
            </button>
          )}
        </div>
      </SectionCard>

      {/* E5 — Version History */}
      <SectionCard title="Version History">
        {versions.length === 0 ? (
          <p className="text-sm text-zinc-500">No versions yet — generate a PRD first.</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl bg-zinc-800/40 border border-zinc-700 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                  <div>
                    <span className="text-sm font-medium text-zinc-200">
                      Version {v.version}
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">
                      {new Date(v.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* E6 — Embed Widget */}
      <SectionCard title="Embed Widget">
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Embed the competitor radar chart on any page:</p>
          <div className="relative rounded-xl bg-zinc-800 border border-zinc-700 p-4">
            <Code className="absolute top-3 right-3 h-4 w-4 text-zinc-600" />
            <pre className="text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
          </div>
          <button
            onClick={handleCopyEmbed}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs px-3 py-1.5 transition-colors"
          >
            {copiedEmbed ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedEmbed ? "Copied!" : "Copy embed code"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
