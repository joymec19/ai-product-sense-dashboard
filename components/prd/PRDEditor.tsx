// components/prd/PRDEditor.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { PRDDocument } from "@/lib/schemas/prd";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/toast";
import PRDSkeleton from "@/components/prd/PRDSkeleton";
import { Loader2, RefreshCw, FileText } from "lucide-react";

interface PRDEditorProps {
  analysisId: string;
}

export default function PRDEditor({ analysisId }: PRDEditorProps) {
  const [prd, setPrd] = useState<PRDDocument | null>(null);
  const [prdId, setPrdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const { toast } = useToast();

  // Context needed for generation
  const [researchReportId, setResearchReportId] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<unknown[] | null>(null);
  const [homeProductContext, setHomeProductContext] = useState<string | null>(null);

  const fetchPRD = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch the analysis to get category + context
      const { data: analysis, error: analysisErr } = await supabase
        .from("analyses")
        .select("category, home_product_context")
        .eq("id", analysisId)
        .single();

      if (analysisErr || !analysis) {
        setError("Could not load analysis data.");
        setLoading(false);
        return;
      }

      setHomeProductContext(
        typeof analysis.home_product_context === "string"
          ? analysis.home_product_context
          : analysis.home_product_context
            ? JSON.stringify(analysis.home_product_context)
            : analysis.category
      );

      // 2. Find matching research_report
      const { data: report, error: reportErr } = await supabase
        .from("research_reports")
        .select("id, competitors")
        .eq("category", analysis.category)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (reportErr || !report) {
        setError("No research report found for this analysis category.");
        setLoading(false);
        return;
      }

      setResearchReportId(report.id);
      setCompetitors(report.competitors as unknown[]);

      // 3. Check for existing PRD
      const { data: existingPrd, error: prdErr } = await supabase
        .from("prd_documents")
        .select("*")
        .eq("analysis_id", report.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prdErr) {
        setError("Error loading PRD document.");
        setLoading(false);
        return;
      }

      if (existingPrd) {
        setPrdId(existingPrd.id);
        setPrd({
          objective: existingPrd.objective,
          problem_statement: existingPrd.problem_statement,
          solution_narrative: existingPrd.solution_narrative,
          personas: existingPrd.personas,
          features: existingPrd.features,
          success_metrics: existingPrd.success_metrics,
          risks: existingPrd.risks,
          gtm: existingPrd.gtm,
        });
      }
    } catch {
      setError("Unexpected error loading PRD data.");
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchPRD();
  }, [fetchPRD]);

  const handleGenerate = async () => {
    if (!researchReportId || !competitors || !homeProductContext) {
      toast("Cannot generate PRD: missing research report or product context.", "error");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000); // 90s client timeout

      const res = await fetch("/api/generate-prd", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_id: researchReportId,
          competitors,
          home_product_context: homeProductContext,
        }),
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Failed to generate PRD. Please try again.", "error");
        return;
      }

      setPrdId(data.prd_id);
      setPrd(data.prd);
      toast("PRD generated successfully!", "success");
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast("PRD generation timed out. The AI model took too long to respond. Please try again.", "error");
      } else {
        toast("Network error while generating PRD. Please try again.", "error");
      }
    } finally {
      setGenerating(false);
    }
  };

  const saveSection = useCallback(async (field: string, value: unknown) => {
    if (!prdId) return;
    setSavingSection(field);
    try {
      const { error: dbError } = await supabase
        .from("prd_documents")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", prdId);
      if (dbError) {
        toast("Failed to save changes.", "error");
      }
    } finally {
      setSavingSection(null);
    }
  }, [prdId, toast]);

  // ── Initial loading state ──────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Generating state — show skeleton ───────────
  if (generating) {
    return <PRDSkeleton />;
  }

  // ── No PRD state — show generate button ────────
  if (!prd) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No PRD generated for this analysis yet.
        </p>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          onClick={handleGenerate}
          disabled={generating || !researchReportId}
          size="lg"
        >
          Generate PRD
        </Button>
      </div>
    );
  }

  // ── PRD exists — render accordion ──────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Product Requirements Document</h2>
        <div className="flex items-center gap-2">
          {savingSection && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          {prdId && (
            <span className="text-xs text-muted-foreground">v{prd ? "1" : ""}</span>
          )}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["objective"]} className="w-full">
        {/* Objective */}
        <AccordionItem value="objective">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Objective
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); /* TODO: regenerate */ }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={prd.objective}
              onChange={(e) => setPrd({ ...prd, objective: e.target.value })}
              onBlur={() => saveSection("objective", prd.objective)}
              rows={3}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Problem Statement */}
        <AccordionItem value="problem">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Problem
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={prd.problem_statement}
              onChange={(e) => setPrd({ ...prd, problem_statement: e.target.value })}
              onBlur={() => saveSection("problem_statement", prd.problem_statement)}
              rows={5}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Solution */}
        <AccordionItem value="solution">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Solution
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={prd.solution_narrative}
              onChange={(e) => setPrd({ ...prd, solution_narrative: e.target.value })}
              onBlur={() => saveSection("solution_narrative", prd.solution_narrative)}
              rows={5}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Personas */}
        <AccordionItem value="personas">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Personas
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={JSON.stringify(prd.personas, null, 2)}
              onChange={(e) => {
                try {
                  setPrd({ ...prd, personas: JSON.parse(e.target.value) });
                } catch { /* ignore parse errors while editing */ }
              }}
              onBlur={() => saveSection("personas", prd.personas)}
              rows={10}
              className="font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Features — P1 */}
        <AccordionItem value="features-p1">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Features — P1 (Must Have)
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={JSON.stringify(prd.features.p1, null, 2)}
              onChange={(e) => {
                try {
                  setPrd({ ...prd, features: { ...prd.features, p1: JSON.parse(e.target.value) } });
                } catch { /* ignore */ }
              }}
              onBlur={() => saveSection("features", prd.features)}
              rows={12}
              className="font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Features — P2 */}
        <AccordionItem value="features-p2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Features — P2 (Important)
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={JSON.stringify(prd.features.p2, null, 2)}
              onChange={(e) => {
                try {
                  setPrd({ ...prd, features: { ...prd.features, p2: JSON.parse(e.target.value) } });
                } catch { /* ignore */ }
              }}
              onBlur={() => saveSection("features", prd.features)}
              rows={10}
              className="font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Features — P3 */}
        <AccordionItem value="features-p3">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Features — P3 (Nice to Have)
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={JSON.stringify(prd.features.p3, null, 2)}
              onChange={(e) => {
                try {
                  setPrd({ ...prd, features: { ...prd.features, p3: JSON.parse(e.target.value) } });
                } catch { /* ignore */ }
              }}
              onBlur={() => saveSection("features", prd.features)}
              rows={8}
              className="font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Success Metrics */}
        <AccordionItem value="metrics">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Metrics
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={JSON.stringify(prd.success_metrics, null, 2)}
              onChange={(e) => {
                try {
                  setPrd({ ...prd, success_metrics: JSON.parse(e.target.value) });
                } catch { /* ignore */ }
              }}
              onBlur={() => saveSection("success_metrics", prd.success_metrics)}
              rows={10}
              className="font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Risks */}
        <AccordionItem value="risks">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Risks
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={JSON.stringify(prd.risks, null, 2)}
              onChange={(e) => {
                try {
                  setPrd({ ...prd, risks: JSON.parse(e.target.value) });
                } catch { /* ignore */ }
              }}
              onBlur={() => saveSection("risks", prd.risks)}
              rows={10}
              className="font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>

        {/* GTM */}
        <AccordionItem value="gtm">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              GTM
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={JSON.stringify(prd.gtm, null, 2)}
              onChange={(e) => {
                try {
                  setPrd({ ...prd, gtm: JSON.parse(e.target.value) });
                } catch { /* ignore */ }
              }}
              onBlur={() => saveSection("gtm", prd.gtm)}
              rows={12}
              className="font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
