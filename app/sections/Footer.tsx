export default function Footer() {
  const whatsappNumber = "447845420967";
  const whatsappDisplay = "+44 7845 420967";
  const businessEmail = "info@accountsassists.com";

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.28em]">
            Accounts Assists
          </div>
          <div className="text-sm text-muted">
            Tax preparation and accounting services for individuals,
            contractors, taxi drivers, and small businesses—built on accuracy,
            efficiency, and trust.
          </div>
          <div className="text-xs text-muted">
            Accounting &amp; bookkeeping, company tax &amp; VAT returns, self
            assessment tax returns, payroll, and HMRC reporting.
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">
            Contact
          </div>
          <div className="space-y-1 text-sm text-muted">
            <div>
              <a href={`tel:+${whatsappNumber}`} className="hover:text-foreground">
                {whatsappDisplay}
              </a>
            </div>
            <div>
              <a
                href={`mailto:${businessEmail}`}
                className="hover:text-foreground"
              >
                {businessEmail}
              </a>
            </div>
            <div>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">
            Links
          </div>
          <div className="grid gap-2 text-sm text-muted">
            <a href="#services" className="hover:text-foreground">
              Services
            </a>
            <a href="#booking" className="hover:text-foreground">
              Book an appointment
            </a>
            <a href="#contact" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 text-xs text-muted md:flex-row">
          <div>
            © {new Date().getFullYear()} Accounts Assists. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${businessEmail}`}
              className="hover:text-foreground"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
