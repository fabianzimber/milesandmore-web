"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/commands", label: "Commands" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
          scrolled
            ? "bg-navy-950/80 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent",
        )}
      >
        <div className="page-frame !py-0">
          <div className="flex h-16 items-center justify-between sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm p-1 transition group-hover:bg-white/15">
                <Image src="/logo.svg" alt="Miles & More" width={28} height={28} className="w-full h-full object-contain" />
              </div>
              <span className="mono-label text-foreground/80 tracking-[0.2em] hidden sm:block">
                MILES & MORE
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mono-label text-foreground/50 tracking-[0.2em] transition-colors hover:text-gold-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA + Mobile hamburger */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="corner-bracket mono-label text-[10px] tracking-[0.2em] text-foreground/50 transition-colors hover:text-gold-400 hidden md:block"
              >
                ADMIN
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground md:hidden"
                aria-label="Menu öffnen"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-navy-950/98 backdrop-blur-2xl flex flex-col"
          >
            <div className="page-frame !py-0 flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden bg-white/10 p-1">
                  <Image src="/logo.svg" alt="Miles & More" width={28} height={28} className="w-full h-full object-contain" />
                </div>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground"
                aria-label="Menu schließen"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              {[...NAV_LINKS, { href: "/admin", label: "Admin" }].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-3xl font-bold tracking-tight text-foreground hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="page-frame !py-6 text-center">
              <p className="mono-label text-[10px] text-foreground/30">
                MILES & MORE — TWITCH FLIGHT OPS
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
