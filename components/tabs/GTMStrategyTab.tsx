// components/tabs/GTMStrategyTab.tsx
"use client";

import { useState } from "react";
import { useAnalysis } from "@/lib/context/AnalysisContext";
import { useAnalysisData } from "@/hooks/useAnalysis";
import { Loader2, Copy, Check } from "lucide-react";

function TabSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/3" />
          <div className="h-6 bg-zinc-800 rounded animate-pulse" />
          <div className="h-6 bg-zinc-800 rounded animate-pulse w-4/5" />
        </div>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

type PriorityLevel = "P1" | "P2" | "P3";

interface ChannelCard {
  channel: string;
  cac: string;
  targetSignups: string;
  budget: string;
}

interface Experiment {
  rank: number;
  hypothesis: string;
  variantA: string;
  variantB: string;
  successCriteria: string;
  priority: PriorityLevel;
}

const DEMO_EXPERIMENTS: Experiment[] = [
  {
    rank: 1,
    hypothesis: "Showing social proof during onboarding increases activation by 20%",
    variantA: "Standard onboarding flow",
    variantB: "Onboarding with testimonials",
    successCriteria: "20% lift in day-7 activation",
    priority: "P1",
  },
  {
    rank: 2,
    hypothesis: "Freemium users exposed to AI features upgrade at 2× rate",
    variantA: "Feature gated behind paywall",
    variantB: "Limited AI feature unlocked",
    successCriteria: "2× upgrade conversion",
    priority: "P1",
  },
  {
    rank: 3,
    hypothesis: "Weekly digest email increases 30-day retention by 15%",
    variantA: "No digest",
    variantB: "Weekly insights email",
    successCriteria: "15% retention lift",
    priority: "P2",
  },
  {
    rank: 4,
    hypothesis: "In-app tip triggers reduce time-to-value by 30%",
    variantA: "No tooltips",
    variantB: "Contextual tips",
    successCriteria: "30% TTV reduction",
    priority: "P2",
  },
  {
    rank: 5,
    hypothesis: "Referral incentive generates 10% organic growth",
    variantA: "No referral program",
    variantB: "1-month free referral",
    successCriteria: "10% new users from referrals",
    priority: "P3",
  },
];

const PRIORITY_BADGE: Record<PriorityLevel, string> = {
  P1: "bg-red-500/10 text-red-400 border-red-500/20",
  P2: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  P3: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs px-2 py-1 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function GTMStrategyTab() {
  const { analysisId, competitors: ctxCompetitors, analysisTitle } = useAnalysis();
  const { prd, competitors: hookCompetitors, loading } = useAnalysisData(analysisId);
  const competitors = hookCompetitors.length ? hookCompetitors : ctxCompetitors;
  const [gtmLoading, setGtmLoading] = useState(false);
  const [channels, setChannels] = useState<ChannelCard[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  if (loading) return <TabSkeleton />;

  const handleGenerateGTM = async () => {
    setGtmLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // simulate
      setChannels([
        { channel: "Product-Led Growth", cac: "$0", targetSignups: "10,000/mo", budget: "Low" },
        { channel: "Content / SEO", cac: "$12", targetSignups: "5,000/mo", budget: "Medium" },
        { channel: "LinkedIn Ads", cac: "$45", targetSignups: "2,000/mo", budget: "High" },
        { channel: "Partnerships", cac: "$8", targetSignups: "3,000/mo", budget: "Medium" },
      ]);
    } finally {
      setGtmLoading(false);
    }
  };

  const topCompetitor = competitors[0]?.name ?? "competitors";
  const category = analysisTitle || "AI product management";

  // If prd.gtm has real channel data, use it as ChannelCards; otherwise show the generate button
  const prdGtmChannels: ChannelCard[] | null =
    prd?.gtm?.channels && prd.gtm.channels.length > 0
      ? prd.gtm.channels.map((ch) => ({
          channel: ch,
          cac: "—",
          targetSignups: "—",
          budget: "Medium",
        }))
      : null;

  const activeChannels = prdGtmChannels ?? channels;

  // Prepend real positioning statement from PRD if available
  const generatedVariants = [
    `${category} is for product teams who need to ship faster. Unlike ${topCompetitor}, we provide AI-native workflows that cut planning time in half.`,
    `${category} is for PMs who are tired of scattered tools. Unlike ${topCompetitor}, we unify competitive research, PRD generation, and GTM strategy in one place.`,
    `${category} is for growth-focused product orgs. Unlike ${topCompetitor}, we deliver actionable insights — not just dashboards — so you can move from insight to execution.`,
  ];
  const positioningVariants = prd?.gtm?.positioning_statement
    ? [prd.gtm.positioning_statement, ...generatedVariants]
    : generatedVariants;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* D1 — GTM Strategy Generator */}
      <SectionCard title="GTM Strategy Generator">
        {activeChannels.length === 0 ? (
          <button
            onClick={handleGenerateGTM}
            disabled={gtmLoading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            {gtmLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate GTM Plan
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeChannels.map((ch) => (
              <div
                key={ch.channel}
                className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 text-sm">{ch.channel}</span>
                  <span
                    className={`rounded-full border text-xs px-2 py-0.5 font-medium ${
                      ch.budget === "Low"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : ch.budget === "High"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }`}
                  >
                    {ch.budget} budget
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-zinc-400">
                  <span>CAC: <span className="text-zinc-200 font-medium">{ch.cac}</span></span>
                  <span>Target: <span className="text-zinc-200 font-medium">{ch.targetSignups}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* D2 — Positioning Statement Generator */}
      <SectionCard title="Positioning Statement Generator">
        <div className="space-y-3">
          {positioningVariants.map((v, i) => (
            <div
              key={i}
              onClick={() => setSelectedVariant(i)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                selectedVariant === i
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-600"
              }`}
            >
              <p className="text-sm text-zinc-200 leading-relaxed">{v}</p>
              <div className="flex items-center gap-2 mt-3">
                <CopyButton text={v} />
                {selectedVariant !== i && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(i);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Use This
                  </button>
                )}
                {selectedVariant === i && (
                  <span className="text-xs text-indigo-400 font-medium">✓ Selected</span>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => setSelectedVariant(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
          >
            Regenerate variants
          </button>
        </div>
      </SectionCard>

      {/* D3 — Pricing Recommendation */}
      <SectionCard title="Pricing Recommendation">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              tier: "Free",
              color: "border-zinc-700",
              features: [
                "5 analyses/month",
                "Basic competitor profiles",
                "1 PRD draft",
                "Community support",
              ],
            },
            {
              tier: "Pro — $49/mo",
              color: "border-indigo-500 ring-1 ring-indigo-500/30",
              features: [
                "Unlimited analyses",
                "Full competitive intelligence",
                "Unlimited PRD generation",
                "GTM strategy generation",
                "Priority support",
              ],
            },
            {
              tier: "Enterprise",
              color: "border-zinc-700",
              features: [
                "Everything in Pro",
                "Team workspaces",
                "SSO / SAML",
                "Custom integrations",
                "Dedicated CSM",
              ],
            },
          ].map((p) => (
            <div key={p.tier} className={`rounded-xl border bg-zinc-800/40 p-4 space-y-3 ${p.color}`}>
              <p className="font-semibold text-zinc-200 text-sm">{p.tier}</p>
              <ul className="space-y-1">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              {p.tier === "Enterprise" && (
                <button className="w-full rounded-lg border border-zinc-600 text-zinc-300 text-xs py-1.5 hover:bg-zinc-700 transition-colors">
                  Contact Sales
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
          Rationale: Freemium drives top-of-funnel adoption. Pro captures individual PM and startup
          value. Enterprise unlocks team-level usage with procurement-friendly contracts.
        </p>
      </SectionCard>

      {/* D4 — Experiment Roadmap */}
      <SectionCard title="Experiment Roadmap">
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-800/60">
                {["#", "Priority", "Hypothesis", "Variant A", "Variant B", "Success Criteria"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-semibold text-zinc-300 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {DEMO_EXPERIMENTS.map((exp, i) => (
                <tr
                  key={exp.rank}
                  className={`border-t border-zinc-800 ${
                    i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/30"
                  }`}
                >
                  <td className="px-4 py-3 text-zinc-500">{exp.rank}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border text-xs px-2 py-0.5 font-medium ${
                        PRIORITY_BADGE[exp.priority]
                      }`}
                    >
                      {exp.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 max-w-[220px]">{exp.hypothesis}</td>
                  <td className="px-4 py-3 text-zinc-400 max-w-[140px]">{exp.variantA}</td>
                  <td className="px-4 py-3 text-zinc-400 max-w-[140px]">{exp.variantB}</td>
                  <td className="px-4 py-3 text-zinc-400 max-w-[160px]">{exp.successCriteria}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
