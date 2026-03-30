// components/ui/LoadingSkeleton.tsx

interface LoadingSkeletonProps {
  size?: "card" | "table-row" | "chart" | "full-page";
}

function CardSkeleton() {
  return (
    <div className="animate-pulse p-4 rounded-lg bg-zinc-900">
      <div className="h-4 w-3/4 bg-zinc-800 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-zinc-800 rounded" />
        <div className="h-3 w-full bg-zinc-800 rounded" />
        <div className="h-3 w-2/3 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ size = "card" }: LoadingSkeletonProps) {
  if (size === "table-row") {
    return (
      <div className="animate-pulse flex gap-3 px-4 py-3">
        <div className="h-4 w-1/4 bg-zinc-800 rounded" />
        <div className="h-4 w-1/3 bg-zinc-800 rounded" />
        <div className="h-4 w-1/5 bg-zinc-800 rounded" />
        <div className="h-4 w-1/6 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (size === "chart") {
    return (
      <div className="animate-pulse h-48 w-full bg-zinc-800 rounded-lg" />
    );
  }

  if (size === "full-page") {
    return (
      <div className="flex flex-col gap-4 p-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // default: card
  return <CardSkeleton />;
}
