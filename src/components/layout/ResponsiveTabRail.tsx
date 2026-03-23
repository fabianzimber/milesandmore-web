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
          "inline-flex min-w-full items-center gap-1 rounded-full border p-1",
          tone === "dark"
            ? "border-white/10 bg-white/5 text-white/70 backdrop-blur-md"
            : "border-sas-gray-200/70 bg-white/70 text-sas-gray-500 backdrop-blur-xl",
        )}
      >
        {items.map((item) => {
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold transition cursor-pointer sm:gap-2 sm:px-4 sm:py-3 sm:text-sm",
                isActive
                  ? tone === "dark"
                    ? "text-white"
                    : "text-sas-midnight"
                  : tone === "dark"
                    ? "hover:text-white"
                    : "hover:text-sas-midnight",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`tab-rail-${tone}`}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    tone === "dark"
                      ? "bg-white/12 shadow-[0_10px_30px_rgba(3,8,20,0.24)]"
                      : "bg-white shadow-[0_12px_30px_rgba(5,11,25,0.1)]",
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
