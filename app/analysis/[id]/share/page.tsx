// app/analysis/[id]/share/page.tsx — public, no auth required
import { createBrowserClient } from "@supabase/ssr";
import RadarChart from "@/components/charts/RadarChart";
import FeatureMatrix from "@/components/competitors/FeatureMatrix";
import type { Competitor } from "@/lib/schemas/competitor";
import type { PRDDocument } from "@/lib/types/dashboard";
import type { CompetitorData, SupportStatus } from "@/lib/types/dashboard";
import {
  DEMO_SHARE_TOKEN,
  DEMO_CATEGORY,
  DEMO_COMPETITORS,
  DEMO_ALL_FEATURES,
  DEMO_PRD,
} from "@/lib/demo-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Shared render ─────────────────────────────────────────────────────────────
function SharePageContent({
  category,
  competitors,
  allFeatures,
  prd,
  analysisHref,
}: {
  category: string;
  competitors: CompetitorData[];
  allFeatures: string[];
  prd: PRDDocument | null;
  analysisHref: string;
}) {
  const dateLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Product Analysis — Read Only
          </p>
          <h1 className="mt-1 text-3xl font-bold">{category}</h1>
        </div>

        {/* Summary card */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1">
              {category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <span className="font-semibold text-zinc-800">{competitors.length}</span>
            <span>competitors analyzed</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>{dateLabel}</span>
          </div>
        </div>

        {/* Radar Chart — full width */}
        {competitors.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Competitive Radar</h2>
            <div className="w-full">
              <RadarChart competitors={competitors} />
            </div>
          </section>
        )}

        {/* Feature Matrix — read-only */}
        {competitors.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Feature Matrix</h2>
            <FeatureMatrix features={allFeatures} competitors={competitors} />
          </section>
        )}

        {/* PRD Summary card */}
        {prd ? (
          <section className="rounded-xl border border-zinc-200 p-6 space-y-5">
            <h2 className="text-xl font-semibold">PRD Summary</h2>

            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Objective
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">{prd.objective}</p>
            </div>

            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Problem
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">{prd.problem_statement}</p>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Top P1 Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {prd.features.p1.slice(0, 3).map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5"
                  >
                    {f.title}
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section>
            <p className="text-zinc-400 italic">No PRD generated yet for this analysis.</p>
          </section>
        )}

        {/* View Full Analysis CTA */}
        <div className="border-t border-zinc-200 pt-6">
          <a
            href={analysisHref}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            View Full Analysis →
          </a>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
          Built with AI Product Sense · joymec19
        </footer>
      </div>
    </main>
  );
}

export default async function SharePage({ params }: PageProps) {
  const { id: shareToken } = await params;

  // ── Demo shortcut: serve hardcoded data, no DB required ───────────────────
  if (shareToken === DEMO_SHARE_TOKEN) {
    return (
      <SharePageContent
        category={DEMO_CATEGORY}
        competitors={DEMO_COMPETITORS}
        allFeatures={DEMO_ALL_FEATURES}
        prd={DEMO_PRD}
        analysisHref="/"
      />
    );
  }

  // ── Live analysis: look up by share_token ─────────────────────────────────
  const supabase = getSupabase();

  const { data: analysis, error: analysisErr } = await supabase
    .from("analyses")
    .select("id, category")
    .eq("share_token", shareToken)
    .single();

  if (analysisErr || !analysis) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-500">Analysis not found or link is invalid.</p>
      </main>
    );
  }

  // Get research report (competitors)
  const { data: report } = await supabase
    .from("research_reports")
    .select("id, competitors")
    .eq("category", analysis.category)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const rawCompetitors = (report?.competitors ?? []) as Competitor[];

  const competitors: CompetitorData[] = rawCompetitors.map((c) => ({
    name: c.name,
    pricing: c.pricing,
    scores: c.scores,
    ai_sophistication: c.ai_sophistication,
    ux_score: c.ux_score,
    mobile_score: c.mobile_score,
    integration_count: c.integration_count,
    featureSupport: Object.fromEntries(
      c.features.map((f) => [f, "full" as SupportStatus])
    ),
  }));

  const allFeatures = Array.from(
    new Set(rawCompetitors.flatMap((c) => c.features))
  );

  // Get PRD
  let prd: PRDDocument | null = null;
  if (report?.id) {
    const { data: prdDoc } = await supabase
      .from("prd_documents")
      .select("*")
      .eq("analysis_id", report.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prdDoc) {
      prd = {
        id: prdDoc.id,
        analysis_id: prdDoc.analysis_id,
        version: prdDoc.version ?? 1,
        objective: prdDoc.objective,
        problem_statement: prdDoc.problem_statement,
        solution_narrative: prdDoc.solution_narrative,
        personas: prdDoc.personas,
        features: prdDoc.features,
        success_metrics: prdDoc.success_metrics,
        risks: prdDoc.risks,
        gtm: prdDoc.gtm,
      };
    }
  }

  return (
    <SharePageContent
      category={analysis.category}
      competitors={competitors}
      allFeatures={allFeatures}
      prd={prd}
      analysisHref="/"
    />
  );
}
