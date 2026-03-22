"use client";

import { useEffect, useMemo, useState } from "react";

const NAV = [
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "booking", label: "Book" },
  { id: "contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const links = useMemo(
    () =>
      NAV.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={() => setOpen(false)}
          className="relative py-2 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/90 after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:scale-x-100"
        >
          {item.label}
        </a>
      )),
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="text-sm font-semibold uppercase tracking-[0.28em]"
          aria-label="Accounts Assists home"
        >
          Accounts Assists
        </a>

        <nav className="hidden items-center gap-8 md:flex">{links}</nav>

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
            {links}
          </div>
        </div>
      ) : null}
    </header>
  );
}
