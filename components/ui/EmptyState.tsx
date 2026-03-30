// components/ui/EmptyState.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="py-16 px-4 flex flex-col items-center gap-4">
      <Icon className="h-10 w-10 text-zinc-600" />
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold text-zinc-200">{heading}</p>
        <p className="text-sm text-zinc-500 text-center max-w-xs">{subtext}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2",
            "text-sm font-medium text-white transition-colors"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
