"use client";

import { cn } from "@/lib/utils";

interface SASButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function SASButton({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  ...props
}: SASButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold uppercase tracking-[0.14em] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        "active:scale-[0.98] hover:-translate-y-0.5",
        variant === "primary" &&
          "border border-sas-blue/30 bg-gradient-to-r from-sas-blue via-[#5aa2f0] to-sas-blue-light text-white shadow-[0_22px_50px_rgba(74,144,217,0.28)] focus:ring-sas-blue",
        variant === "secondary" &&
          "border border-white/10 bg-white/6 text-foreground shadow-[0_18px_40px_rgba(0,0,0,0.18)] hover:border-sas-blue/28 hover:text-sas-blue focus:ring-sas-blue",
        variant === "ghost" &&
          "bg-transparent text-sas-gray-500 hover:bg-white/6 hover:text-foreground focus:ring-sas-blue",
        variant === "danger" &&
          "border border-red-400/20 bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-[0_18px_40px_rgba(239,91,107,0.24)] focus:ring-red-500",
        variant === "gold" &&
          "border border-gold-300/35 bg-gradient-to-r from-sas-gold-dim via-sas-gold to-sas-gold-light text-navy-950 shadow-[0_22px_52px_rgba(200,169,110,0.26)] focus:ring-sas-gold",
        size === "sm" && "text-[0.68rem] px-4 py-2.5 gap-1.5",
        size === "md" && "text-[0.72rem] px-5 py-3.5 gap-2",
        size === "lg" && "text-[0.78rem] px-7 py-4 gap-2.5",
        className
      )}
      {...props}
    >
      {variant === "gold" && !disabled && (
        <span className="absolute inset-0 shimmer pointer-events-none" />
      )}
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
