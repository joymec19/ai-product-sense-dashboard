// components/prd/PRDSkeleton.tsx
"use client";

const SECTIONS = [
  "Objective",
  "Problem",
  "Solution",
  "Personas",
  "Features — P1 (Must Have)",
  "Features — P2 (Important)",
  "Features — P3 (Nice to Have)",
  "Metrics",
  "Risks",
  "GTM",
];

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className ?? ""}`}
    />
  );
}

export default function PRDSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-6 w-64" />
        <SkeletonPulse className="h-4 w-8" />
      </div>
      <div className="space-y-1">
        {SECTIONS.map((section) => (
          <div key={section} className="border-b border-border py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SkeletonPulse className="h-5 w-32" />
                <SkeletonPulse className="h-4 w-4 rounded-full" />
              </div>
              <SkeletonPulse className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Generating PRD with AI... This may take 30–60 seconds
        </p>
      </div>
    </div>
  );
}
