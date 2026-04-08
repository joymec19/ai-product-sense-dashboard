// components/market/TrendFeed.tsx
"use client";

interface TrendFeedProps {
  category: string;
}

export default function TrendFeed({ category: _ }: TrendFeedProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 flex flex-col items-center gap-2 text-center">
      <p className="text-xs text-zinc-500 uppercase tracking-widest">No trend data</p>
      <p className="text-sm text-zinc-400 max-w-xs">
        Live trend signals will appear here once the market analysis is run.
      </p>
    </div>
  );
}
