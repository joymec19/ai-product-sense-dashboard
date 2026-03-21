// app/analysis/[id]/share/page.tsx — public, no auth required
import { createClient } from "@supabase/supabase-js";
import RadarChart from "@/components/charts/RadarChart";
import FeatureMatrix from "@/components/competitors/FeatureMatrix";
import type { Competitor } from "@/lib/schemas/competitor";
import type { PRDDocument } from "@/lib/schemas/prd";
import type { CompetitorData, SupportStatus } from "@/lib/types/dashboard";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function SharePage({ params }: PageProps) {
  const { id: shareToken } = await params;
  const supabase = getSupabase();

  // 1. Look up analysis by share_token
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

  // 2. Get research report (competitors)
  const { data: report } = await supabase
    .from("research_reports")
    .select("id, competitors")
    .eq("category", analysis.category)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const rawCompetitors = (report?.competitors ?? []) as Competitor[];

  // Map legacy Competitor shape → CompetitorData for the new chart components
  const competitors: CompetitorData[] = rawCompetitors.map((c) => ({
    name: c.name,
    pricing: c.pricing,
    scores: {
      ai_sophistication: c.scores.innovation ?? 0,
      pricing_value: c.scores.value_for_money ?? 0,
      mobile_ux: c.scores.ease_of_use ?? 0,
      integrations: c.scores.product_depth ?? 0,
      learning_curve: c.scores.ease_of_use ?? 0,
    },
    featureSupport: Object.fromEntries(
      c.features.map((f) => [f, "full" as SupportStatus])
    ),
  }));

  const allFeatures = Array.from(
    new Set(rawCompetitors.flatMap((c) => c.features))
  );

  // 3. Get PRD
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
    <main className="min-h-screen bg-white px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Product Analysis — Read Only
          </p>
          <h1 className="mt-1 text-3xl font-bold">{analysis.category}</h1>
        </div>

        {/* Radar Chart */}
        {competitors.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Competitive Radar</h2>
            <RadarChart competitors={competitors} />
          </section>
        )}

        {/* Feature Matrix */}
        {competitors.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Feature Matrix</h2>
            <FeatureMatrix features={allFeatures} competitors={competitors} />
          </section>
        )}

        {/* PRD Summary */}
        {prd ? (
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">PRD Summary</h2>

            <div>
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Objective
              </h3>
              <p className="text-zinc-700">{prd.objective}</p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Problem
              </h3>
              <p className="text-zinc-700">{prd.problem_statement}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                P1 Features (Must Have)
              </h3>
              <ul className="space-y-3">
                {prd.features.p1.slice(0, 3).map((f) => (
                  <li key={f.id} className="rounded-lg border border-zinc-200 p-4">
                    <p className="font-semibold text-zinc-800">{f.title}</p>
                    <p className="mt-1 text-sm text-zinc-600">{f.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section>
            <p className="text-zinc-400 italic">No PRD generated yet for this analysis.</p>
          </section>
        )}

        {/* View Full Analysis link */}
        <div className="border-t border-zinc-200 pt-6">
          <a
            href={`/analysis/${analysis.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            View Full Analysis →
          </a>
        </div>
      </div>
    </main>
  );
}
