"use client";

import { useEffect, useRef } from "react";
import { cancelFrame, frame, useReducedMotion } from "framer-motion";
import { ReactLenis, type LenisRef } from "lenis/react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp);
    }

    frame.update(update, true);
    return () => cancelFrame(update);
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
        lerp: 0.085,
      }}
    >
      {children}
    </ReactLenis>
  );
}
