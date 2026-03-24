"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  partClassName?: string;
  mode?: "chars" | "words";
  delay?: number;
  stagger?: number;
}

export default function TextReveal({
  text,
  as = "span",
  className,
  partClassName,
  mode = "chars",
  delay = 0,
  stagger = 0.03,
}: TextRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (shouldReduceMotion || !rootRef.current) {
      return;
    }

    const targets = rootRef.current.querySelectorAll("[data-reveal-part]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          delay,
          stagger,
          ease: "power3.out",
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [delay, shouldReduceMotion, stagger, text]);

  const parts = mode === "chars" ? Array.from(text) : text.split(" ");
  const content = (
    <>
      {parts.map((part, index) => (
        <span
          key={`${part}-${index}`}
          className={cn("inline-block overflow-hidden align-baseline", mode === "words" && "mr-[0.28em] last:mr-0")}
        >
          <span
            data-reveal-part
            className={cn("inline-block will-change-transform", partClassName)}
            aria-hidden="true"
          >
            {part === " " ? "\u00A0" : part}
          </span>
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </>
  );

  if (as === "p") {
    return (
      <p ref={rootRef as React.RefObject<HTMLParagraphElement>} className={cn("overflow-hidden", className)}>
        {content}
      </p>
    );
  }

  if (as === "h1") {
    return (
      <h1 ref={rootRef as React.RefObject<HTMLHeadingElement>} className={cn("overflow-hidden", className)}>
        {content}
      </h1>
    );
  }

  if (as === "h2") {
    return (
      <h2 ref={rootRef as React.RefObject<HTMLHeadingElement>} className={cn("overflow-hidden", className)}>
        {content}
      </h2>
    );
  }

  if (as === "h3") {
    return (
      <h3 ref={rootRef as React.RefObject<HTMLHeadingElement>} className={cn("overflow-hidden", className)}>
        {content}
      </h3>
    );
  }

  return (
    <span ref={rootRef as React.RefObject<HTMLSpanElement>} className={cn("overflow-hidden", className)}>
      {content}
    </span>
  );
}
