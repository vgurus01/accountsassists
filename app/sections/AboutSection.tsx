import Image from "next/image";
import profiler from "../image/profiler.webp";

const WHY_CHOOSE_US = [
  {
    title: "CIMA Certified Expert",
    body: "Led by Susiri Padmakumara, a Chartered Management Accountant (UK) with 20+ years of experience. You’re not just getting a service—you’re gaining a trusted financial partner.",
  },
  {
    title: "Specialised Services",
    body: "We cater to everyone, from taxi drivers and small businesses to contractors. We understand your unique needs and help you navigate self-assessment tax returns effortlessly.",
  },
  {
    title: "Accuracy & Efficiency",
    body: "We keep your records in order and compliant, handling the numbers accurately so you can focus on what you do best—running your business.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-start md:py-28">
        <div className="space-y-6">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            About Accounts Assists
          </div>
          <h2 className="text-3xl leading-tight md:text-4xl">
            Meet your trusted financial partner.
          </h2>
          <p className="text-sm leading-7 text-muted md:text-base">
            At Accounts Assists, we believe in more than just crunching numbers.
            We build relationships. Founded on the principle of providing
            expert, personalised financial guidance, our mission is to empower
            businesses and individuals to achieve their financial goals.
          </p>
          <p className="text-sm leading-7 text-muted md:text-base">
            With over two decades of experience in the accounting industry,
            we&apos;ve seen it all. We&apos;re passionate about helping our
            community—from taxi drivers managing their self-assessment to small
            business owners looking for reliable bookkeeping—simplifying the
            complex and giving you peace of mind.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {WHY_CHOOSE_US.map((v) => (
              <div key={v.title} className="border border-border bg-surface p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {v.title}
                </div>
                <div className="mt-3 text-sm leading-7 text-muted">{v.body}</div>
              </div>
            ))}
          </div>

          <div className="border border-border bg-surface p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Susiri Padmakumara ACMA, CGMA, MBA, LLM
            </div>
            <div className="mt-3 text-sm leading-7 text-muted">
              As a CIMA Certified expert, Susiri ensures your financial affairs
              are handled with the utmost professionalism and strategic insight.
              Combined with advanced degrees in Business Administration and Law,
              this provides a strong foundation to manage complex financial
              landscapes, minimise your tax burden, and set your business up for
              success.
            </div>
          </div>
        </div>

        <div className="border border-border bg-surface p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Founder
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-[9rem,1fr] md:items-center">
            <div className="relative aspect-square w-full overflow-hidden border border-border bg-background">
              <div className="absolute inset-0 bg-noise" aria-hidden="true" />
              <Image
                src={profiler}
                alt="Susiri Padmakumara"
                fill
                className="object-cover object-center contrast-125"
              />
            </div>

            <div className="space-y-3">
              <div className="text-lg font-semibold tracking-tight">
                Susiri Padmakumara
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                ACMA, CGMA, MBA, LLM
              </div>
              <div className="text-sm leading-7 text-muted">
                CIMA Certified expert providing personalised, strategic guidance
                to minimise tax burden and help you stay compliant.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
