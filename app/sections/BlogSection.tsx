import Link from "next/link";
import {
  BLOG_POSTS,
  formatBlogDate,
  getBlogPostPath,
} from "../lib/blog";

const FEATURED_POST = BLOG_POSTS[0];

const SEARCH_TOPICS = [
  "Self assessment guides",
  "Allowable expenses",
  "HMRC deadline prep",
];

export default function BlogSection() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
        <div className="relative overflow-hidden border border-border bg-background p-8 md:p-10">
          <div className="absolute inset-0 bg-noise opacity-40" aria-hidden="true" />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              The Journal
            </div>
            <h2 className="mt-3 max-w-xl text-3xl leading-tight md:text-5xl">
              Practical tax notes that turn filing pressure into clear next
              steps.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted md:text-base">
              Explore concise guides on self assessment, bookkeeping, VAT,
              payroll, and year-end preparation. The articles are written for
              the questions clients actually ask before deadlines get close.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {SEARCH_TOPICS.map((topic, index) => (
                <div key={topic} className="border border-border bg-surface p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    {`${index + 1}`.padStart(2, "0")}
                  </div>
                  <div className="mt-3 text-sm leading-6">{topic}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
              >
                Visit the blog
              </Link>
              <Link
                href={getBlogPostPath(FEATURED_POST.slug)}
                className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Read the featured post
              </Link>
            </div>
          </div>
        </div>

        <article className="border border-border bg-background">
          <div className="border-b border-border p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              <span>{FEATURED_POST.category}</span>
              <span className="h-1 w-1 bg-foreground" />
              <span>{formatBlogDate(FEATURED_POST.publishedAt)}</span>
              <span className="h-1 w-1 bg-foreground" />
              <span>{FEATURED_POST.readTime}</span>
            </div>

            <h3 className="mt-5 text-3xl leading-tight">
              {FEATURED_POST.title}
            </h3>
            <p className="mt-5 text-sm leading-7 text-muted md:text-base">
              {FEATURED_POST.excerpt}
            </p>
          </div>

          <div className="grid gap-4 p-8">
            {FEATURED_POST.highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-start gap-4 border border-border bg-surface p-4 text-sm leading-6 text-muted"
              >
                <span className="mt-2 h-2 w-2 shrink-0 bg-foreground" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-8 py-6">
            <Link
              href={getBlogPostPath(FEATURED_POST.slug)}
              className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.22em] text-foreground"
            >
              Open article
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
