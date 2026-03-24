"use client";

import SASButton from "@/components/ui/SASButton";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="noise-overlay" />
      <div className="night-panel relative max-w-xl rounded-[2rem] p-8 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,144,217,0.1),transparent_34%)]" />
        <p className="eyebrow justify-center">Application Error</p>
        <h1 className="mt-4 text-3xl font-extrabold">Die Miles &amp; More-Webapp hat einen Fehler erkannt.</h1>
        <p className="mt-3 text-sm text-foreground/40">{error.message}</p>
        <div className="mt-6 flex justify-center">
          <SASButton onClick={reset} variant="gold">Erneut versuchen</SASButton>
        </div>
      </div>
    </div>
  );
}
