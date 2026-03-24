"use client";

import { cn } from "@/lib/utils";

interface SASCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "dark" | "outlined" | "glow";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export default function SASCard({
  className,
  variant = "default",
  padding = "md",
  hover = false,
  children,
  ...props
}: SASCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] transition-all duration-300",
        variant === "default" && "surface-glass",
        variant === "glass" && "surface-glass",
        variant === "elevated" && "surface-elevated",
        variant === "dark" && "night-panel",
        variant === "outlined" && "bg-transparent border border-gold-400/15",
        variant === "glow" && "surface-glass glow-gold border border-gold-400/10",
        padding === "none" && "p-0",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        hover && "hover:border-gold-400/20 cursor-pointer hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
