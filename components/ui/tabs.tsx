"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

// ── Context ────────────────────────────────────────────────────────────────────
interface TabsContextValue {
  active: string;
  setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponent must be used inside <Tabs>");
  return ctx;
}

// ── Tabs (root) ────────────────────────────────────────────────────────────────
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;

  const setActive = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ── TabsList ───────────────────────────────────────────────────────────────────
interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 rounded-xl bg-zinc-800 p-1 overflow-x-auto scrollbar-none",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── TabsTrigger ────────────────────────────────────────────────────────────────
interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const { active, setActive } = useTabsContext();
  const isActive = active === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn(
        "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-zinc-900 text-white shadow-sm"
          : "text-zinc-400 hover:text-zinc-200",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── TabsContent ────────────────────────────────────────────────────────────────
interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { active } = useTabsContext();
  if (active !== value) return null;

  return (
    <div role="tabpanel" className={cn("mt-4", className)}>
      {children}
    </div>
  );
}
