"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, type LenisRef } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    let cleanup: (() => void) | undefined;
    const frameId = window.requestAnimationFrame(() => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) {
        return;
      }

      const update = (time: number) => {
        lenis.raf(time * 1000);
      };

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        lenis.off("scroll", ScrollTrigger.update);
        gsap.ticker.remove(update);
      };
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: 1.1,
        lerp: 0.08,
      }}
    >
      {children}
    </ReactLenis>
  );
}
