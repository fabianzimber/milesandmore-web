"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export default function MagneticButton({ children, href, className }: MagneticButtonProps) {
  const rootRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) {
      return;
    }

    const xTo = gsap.quickTo(inner, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(inner, "y", { duration: 0.35, ease: "power3.out" });

    const onMove = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const rect = root.getBoundingClientRect();
      const offsetX = pointerEvent.clientX - rect.left - rect.width / 2;
      const offsetY = pointerEvent.clientY - rect.top - rect.height / 2;
      xTo(offsetX * 0.18);
      yTo(offsetY * 0.18);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const classes = cn(
    "nav-bracket border border-gold-300/0 bg-white/5 text-[0.72rem] font-semibold text-gold-300 transition-colors hover:text-foreground",
    className,
  );

  if (href) {
    return (
      <Link href={href} ref={rootRef as React.Ref<HTMLAnchorElement>} className={classes}>
        <span ref={innerRef} className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </Link>
    );
  }

  return (
    <button ref={rootRef as React.Ref<HTMLButtonElement>} className={classes} type="button">
      <span ref={innerRef} className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
