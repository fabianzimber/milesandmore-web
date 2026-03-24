"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  splitBy?: "chars" | "words" | "lines";
  trigger?: "scroll" | "mount";
  stagger?: number;
}

export default function TextReveal({
  children,
  as: Tag = "h1",
  className,
  delay = 0,
  splitBy = "words",
  trigger = "mount",
  stagger = 0.04,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const text = el.textContent || "";
    let units: string[];

    if (splitBy === "chars") {
      units = text.split("");
    } else if (splitBy === "lines") {
      units = text.split("\n").filter(Boolean);
    } else {
      units = text.split(/\s+/).filter(Boolean);
    }

    el.innerHTML = units
      .map(
        (unit) =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:top"><span class="tr-unit" style="display:inline-block;transform:translateY(110%);opacity:0">${unit}</span></span>`,
      )
      .join(splitBy === "chars" ? "" : " ");

    const targets = el.querySelectorAll(".tr-unit");

    const animConfig = {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger,
      delay,
      ease: "power3.out",
    };

    if (trigger === "scroll") {
      gsap.to(targets, {
        ...animConfig,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    } else {
      gsap.to(targets, animConfig);
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [children, splitBy, trigger, delay, stagger]);

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={cn(className)}>
      {children}
    </Tag>
  );
}
