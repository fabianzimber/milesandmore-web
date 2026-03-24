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
        variant === "default" && "control-panel text-foreground",
        variant === "glass" && "glass text-foreground",
        variant === "elevated" && "surface-elevated border border-white/8 text-foreground",
        variant === "dark" && "night-panel text-white shadow-2xl",
        variant === "outlined" && "bg-transparent border border-sas-blue/18 text-foreground",
        variant === "glow" && "glass glow-blue border border-sas-blue/12 text-foreground",
        padding === "none" && "p-0",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        hover && "card-hover-lift hover:border-sas-blue/20 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
