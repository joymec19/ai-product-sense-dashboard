import Link from 'next/link'
import { EmptyDashboard } from '@/components/empty/EmptyDashboard'
import { getDashboardHomeData } from '@/lib/dashboard/getDashboardHomeData'

function UsageCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-100">{value}</div>
    </div>
  )
}

function QuickStartCard({
  title,
  description,
  href,
  cta,
}: {
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
      <div className="text-sm font-semibold text-zinc-100">{title}</div>
      <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white"
      >
        {cta}
      </Link>
    </div>
  )
}

export default async function DashboardHomePage() {
  const data = await getDashboardHomeData()

  if (data.analyses.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <EmptyDashboard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <section className="grid gap-4 md:grid-cols-3">
        <UsageCard label="Analyses" value={String(data.summary.totalAnalyses)} />
        <UsageCard label="Active GTM Plans" value={String(data.summary.activePlans)} />
        <UsageCard label="Last Activity" value={data.summary.lastActivityLabel} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-100">Recent analyses</h2>
          </div>
          <ul className="divide-y divide-zinc-800">
            {data.analyses.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dashboard/analysis/${item.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-800/50"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{item.productName}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{item.updatedAtLabel}</div>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">{item.statusLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <QuickStartCard
            title="Competitive Intelligence"
            description="Map competitors, compare positioning, and find gaps."
            href="/dashboard/new?focus=competitive"
            cta="Start Competitive Analysis"
          />
          <QuickStartCard
            title="Market Intelligence"
            description="Estimate opportunity size and watch trends."
            href="/dashboard/new?focus=market"
            cta="Analyze Market"
          />
          <QuickStartCard
            title="GTM Planner"
            description="Define ICP, positioning, channels, and launch plan."
            href="/dashboard/new?focus=gtm"
            cta="Build GTM Plan"
          />
        </div>
      </section>
    </div>
  )
}
