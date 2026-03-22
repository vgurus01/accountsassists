import { SERVICES } from "../lib/services";

export default function ServicesSection() {
  return (
    <section id="services" className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Our Services
            </div>
            <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
              Our comprehensive services.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted md:text-base">
              We offer a full range of accounting and tax services tailored to
              meet your specific needs. Whether you&apos;re an individual or a
              business, we have a solution for you.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex w-fit items-center justify-center border border-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Contact us today
          </a>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.map((service, idx) => (
            <div
              key={service.id}
              className="border border-border bg-surface px-8 py-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    {`${idx + 1}`.padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 text-2xl leading-tight">{service.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {service.summary}
                  </p>
                </div>
                <div className="h-10 w-10 border border-border bg-background" />
              </div>

              <ul className="mt-6 grid gap-2 text-sm text-muted">
                {service.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 bg-foreground" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
                >
                  Book this service
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
