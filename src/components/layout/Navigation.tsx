"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/commands", label: "Commands" },
  { href: "/demo", label: "Live Flight" },
] as const;

interface NavigationProps {
  tone?: "night" | "control";
}

export default function Navigation({ tone = "night" }: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isHidden = useMemo(
    () => pathname.startsWith("/admin") || pathname.startsWith("/flight/"),
    [pathname],
  );

  useEffect(() => {
    if (isHidden) return;

    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHidden]);

  if (isHidden) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isScrolled || tone === "control" ? "pt-3" : "pt-0",
        )}
      >
        <div className="page-frame !py-0">
          <nav
            className={cn(
              "flex items-center justify-between gap-4 rounded-full px-4 py-3 transition-all duration-300 sm:px-6",
              isScrolled || tone === "control"
                ? "border border-white/8 bg-[rgba(6,10,20,0.8)] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
                : "bg-transparent",
            )}
            aria-label="Primary"
          >
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <span className="mono-label !gap-2 !text-[0.62rem] !tracking-[0.22em] !text-gold-300 before:hidden">
                Miles & More
              </span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-[0.68rem] font-semibold uppercase tracking-[0.24em] transition-colors",
                      isActive ? "text-foreground" : "text-white/58 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:block">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="nav-bracket text-[0.66rem] font-semibold text-gold-300 transition-colors hover:text-foreground"
              >
                Admin
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/5 text-white/80 md:hidden"
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </nav>
        </div>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-[rgba(5,5,16,0.92)] backdrop-blur-2xl md:hidden">
          <div className="page-frame flex min-h-screen flex-col justify-center gap-6 pt-24">
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-3xl font-semibold tracking-[-0.04em] transition-transform duration-300",
                    isActive ? "text-foreground" : "text-white/62",
                  )}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-6">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="nav-bracket text-[0.72rem] font-semibold text-gold-300"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
