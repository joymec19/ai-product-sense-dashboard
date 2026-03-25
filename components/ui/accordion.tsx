// components/ui/accordion.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionContext = React.createContext<{
  openItems: string[];
  toggle: (value: string) => void;
}>({ openItems: [], toggle: () => {} });

const AccordionItemContext = React.createContext<string>("");

function Accordion({
  children,
  type = "multiple",
  defaultValue = [],
  className,
}: {
  children: React.ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string[];
  className?: string;
}) {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultValue);

  const toggle = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value];
        }
        return prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value];
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ value, children }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className="border-b">{children}</div>
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps) {
  const { openItems, toggle } = React.useContext(AccordionContext);
  const value = React.useContext(AccordionItemContext);
  const isOpen = openItems.includes(value);

  return (
    <h3 className="flex">
      <button
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        onClick={() => toggle(value)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </h3>
  );
}

function AccordionContent({ children, className }: AccordionContentProps) {
  const { openItems } = React.useContext(AccordionContext);
  const value = React.useContext(AccordionItemContext);
  const isOpen = openItems.includes(value);

  return (
    <div
      className={cn(
        "overflow-hidden text-sm pb-4 pt-0",
        !isOpen && "hidden print:block",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
