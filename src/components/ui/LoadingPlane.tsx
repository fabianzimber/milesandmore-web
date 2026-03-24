"use client";

import { motion } from "framer-motion";

export default function LoadingPlane({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="night-panel mx-auto flex max-w-md flex-col items-center justify-center gap-8 rounded-[2rem] px-8 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-15%] top-[-10%] h-40 w-40 rounded-full bg-sas-blue/20 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-5%] h-40 w-40 rounded-full bg-sas-gold/18 blur-3xl" />
      </div>

      <div className="relative w-64 h-24">
        <svg viewBox="0 0 260 80" className="w-full h-full" fill="none">
          <motion.path
            d="M 10 60 Q 65 10, 130 40 Q 195 70, 250 20"
            stroke="rgba(74,144,217,0.18)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M 10 60 Q 65 10, 130 40 Q 195 70, 250 20"
            stroke="rgba(200,169,110,0.76)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>

        <motion.div
          className="absolute text-2xl"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            offsetPath: "path('M 10 60 Q 65 10, 130 40 Q 195 70, 250 20')",
            offsetRotate: "auto",
          }}
        >
          <span className="text-gold-300">✈</span>
        </motion.div>

        <motion.div
          className="absolute left-1 bottom-3 w-2.5 h-2.5 rounded-full bg-sas-blue"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-1 top-3 w-2.5 h-2.5 rounded-full bg-sas-gold"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
          <span className="eyebrow !text-gold-300/80">FlightOps Runtime</span>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium tracking-widest uppercase text-white/82">
            {text}
          </span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 h-1 rounded-full bg-sas-gold-light"
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </span>
        </div>
        <p className="text-center text-sm text-white/45">Initialisiere Dashboard, Flight State und Livemetriken.</p>
      </div>
    </div>
  );
}
