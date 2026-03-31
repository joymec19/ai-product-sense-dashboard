// components/ui/tooltip.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex items-center", className)}>
      {children}
      <span
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 shadow-xl",
          "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          side === "top"
            ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
            : "top-full left-1/2 mt-2 -translate-x-1/2"
        )}
      >
        {content}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
            side === "top"
              ? "top-full border-t-zinc-800"
              : "bottom-full border-b-zinc-800"
          )}
        />
      </span>
    </span>
  );
}
