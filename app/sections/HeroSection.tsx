import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="top" className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl items-stretch gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-3 border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <span className="inline-block h-2 w-2 bg-foreground" />
            20+ years of experience
          </div>

          <h1 className="text-4xl leading-[1.06] tracking-tight md:text-6xl">
            Tax Preparation
            <br />& Accounting
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
            Your trusted financial partners with over 20 years of experience. We
            help individuals and small businesses navigate their finances with
            confidence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
            >
              Contact us today
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Learn more
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
            <div className="border border-border bg-surface px-4 py-4">
              <div className="text-2xl font-semibold tracking-tight">20+</div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                Years experience
              </div>
            </div>
            <div className="border border-border bg-surface px-4 py-4">
              <div className="text-2xl font-semibold tracking-tight">CIMA</div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                Certified expert
              </div>
            </div>
            <div className="border border-border bg-surface px-4 py-4">
              <div className="text-2xl font-semibold tracking-tight">Tailored</div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                For your needs
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border border-border bg-surface">
          <div className="absolute left-6 top-6 z-10 border border-border bg-background px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Trusted financial partner
            </div>
          </div>
          <div className="absolute inset-0 bg-noise" aria-hidden="true" />
          <Image
            src="/hero.jpg"
            alt="Business meeting hero image"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
