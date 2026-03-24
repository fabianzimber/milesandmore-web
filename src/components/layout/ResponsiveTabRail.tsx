"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabRailItem<T extends string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  shortLabel?: string;
}

interface ResponsiveTabRailProps<T extends string> {
  items: TabRailItem<T>[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
  tone?: "light" | "dark";
}

export default function ResponsiveTabRail<T extends string>({
  items,
  active,
  onChange,
  className,
  tone = "light",
}: ResponsiveTabRailProps<T>) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn("tab-rail overflow-x-auto", className)}>
      <div
        className={cn(
          "inline-flex min-w-full items-center gap-2 border-b pb-1",
          tone === "dark"
            ? "border-white/10 text-white/68"
            : "border-white/8 text-sas-gray-500",
        )}
      >
        {items.map((item) => {
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition cursor-pointer sm:gap-2 sm:px-4 sm:text-sm lg:gap-1.5 lg:px-3 lg:text-xs",
                isActive
                  ? tone === "dark"
                    ? "text-foreground"
                    : "text-foreground"
                  : tone === "dark"
                    ? "hover:text-foreground"
                    : "hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`tab-rail-${tone}`}
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-px",
                    tone === "dark"
                      ? "bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_24px_rgba(200,169,110,0.42)]"
                      : "bg-gradient-to-r from-transparent via-gold-400 to-transparent",
                  )}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
