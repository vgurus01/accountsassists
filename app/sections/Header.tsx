"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/#booking", label: "Book" },
  { href: "/#contact", label: "Contact" },
];

const PROMO_ITEMS = [
  { label: "FIRST CONSULTATION IS FREE" },
  { label: "15 MIN FREE CONSULT" },
  { label: "BEST VALUE" },
  { label: "$$" },
  { href: "/#booking", label: "BOOK NOW" },
] as const;

// Renders one full "set" of promo items — repeated twice in the track for seamless loop
function PromoStrip({ stripId, onNavigate }: { stripId: string; onNavigate: () => void }) {
  // Repeat the items 4 times per strip so the strip is always wider than any viewport
  const repeats = Array.from({ length: 1 });
  return (
    <div className="flex shrink-0 items-center">
      {repeats.map((_, repeatIndex) =>
        PROMO_ITEMS.map((item, itemIndex) => (
          <span
            key={`${stripId}-${repeatIndex}-${item.label}`}
            className="inline-flex shrink-0 items-center"
          >
            {(repeatIndex > 0 || itemIndex > 0) && (
              <span aria-hidden="true" className="mx-5 text-white/40">|</span>
            )}
            {"href" in item ? (
              <Link
                href={item.href}
                onClick={onNavigate}
                className="text-[#ef4444] hover:text-[#f87171] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-white">{item.label}</span>
            )}
          </span>
        ))
      )}
      <span aria-hidden="true" className="mx-5 text-white/40">|</span>
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="promo-marquee py-2 text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-xs">
            <div className="promo-marquee-track">
              <PromoStrip stripId="a" onNavigate={closeMenu} />
              <PromoStrip stripId="b" onNavigate={closeMenu} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em]"
          aria-label="Accounts Assists home"
        >
          <Image
            src="/LogoAA.png"
            alt="Accounts Assists logo"
            width={28}
            height={28}
            className="rounded"
          />
          <span>Accounts Assists</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) =>
            item.label === "Book" ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white bg-[#ef4444] hover:bg-[#dc2626] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="relative py-2 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/90 after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center gap-3 border border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <span className="sr-only">Toggle menu</span>
          Menu
          <span className="inline-block h-px w-5 bg-foreground" />
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4">
            {NAV.map((item) =>
              item.label === "Book" ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ef4444]"
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="relative py-2 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/90 after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
