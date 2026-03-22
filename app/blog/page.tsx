import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../sections/Footer";
import Header from "../sections/Header";
import {
  BLOG_POSTS,
  formatBlogDate,
  getBlogPostPath,
} from "../lib/blog";
import {
  absoluteUrl,
  buildPageMetadata,
  getFullTitle,
  getSiteUrl,
} from "../lib/seo";

const PAGE_TITLE = "Accounting & Tax Blog";
const PAGE_DESCRIPTION =
  "Practical UK accounting and tax articles covering self assessment, bookkeeping, VAT, payroll, HMRC deadlines, and small business finance decisions.";

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/blog",
  keywords: [
    "UK accounting blog",
    "tax blog UK",
    "self assessment guides",
    "bookkeeping tips",
    "HMRC updates and advice",
    "small business tax articles",
  ],
  category: "Accounting Blog",
  classification: "Accounting & Tax Articles",
});

const FEATURED_POST = BLOG_POSTS[0];

export default function BlogPage() {
  const siteUrl = getSiteUrl();
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": absoluteUrl("/blog/#blog"),
    url: absoluteUrl("/blog"),
    name: "Accounts Assists Blog",
    description: PAGE_DESCRIPTION,
    inLanguage: "en-GB",
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    publisher: {
      "@id": `${siteUrl}/#accountingservice`,
    },
    blogPost: BLOG_POSTS.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: absoluteUrl(getBlogPostPath(post.slug)),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Organization",
        name: post.author,
      },
    })),
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/blog/#webpage"),
    url: absoluteUrl("/blog"),
    name: getFullTitle(PAGE_TITLE),
    description: PAGE_DESCRIPTION,
    inLanguage: "en-GB",
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    about: [
      "Self assessment guides",
      "Bookkeeping tips",
      "VAT returns",
      "Payroll advice",
      "HMRC deadlines",
    ],
    mainEntity: {
      "@id": absoluteUrl("/blog/#blog"),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-24">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Accounts Assists Blog
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl leading-[1.04] tracking-tight md:text-6xl">
                Clear UK tax and accounting articles for the questions that slow
                businesses down.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted md:text-lg">
                Read practical guidance on self assessment, bookkeeping, VAT,
                payroll, and HMRC deadlines. The goal is simple: fewer filing
                surprises, cleaner records, and faster decisions.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={getBlogPostPath(FEATURED_POST.slug)}
                  className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
                >
                  Read featured article
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Ask about your return
                </Link>
              </div>
            </div>

            <div className="border border-border bg-surface p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Featured now
              </div>
              <h2 className="mt-4 text-3xl leading-tight">
                {FEATURED_POST.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted md:text-base">
                {FEATURED_POST.description}
              </p>

              <div className="mt-8 grid gap-3">
                {FEATURED_POST.highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 border border-border bg-background p-4 text-sm leading-6"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-foreground" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Latest Article
                </div>
                <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
                  Straightforward guidance for sole traders preparing to file.
                </h2>
              </div>
              <div className="max-w-xl text-sm leading-7 text-muted md:text-base">
                Start with the featured guide below, then use the service pages
                when you want direct support on bookkeeping, tax returns, or
                compliance.
              </div>
            </div>

            <div className="mt-12">
              {BLOG_POSTS.map((post) => (
                <article
                  key={post.slug}
                  className="grid overflow-hidden border border-border bg-background md:grid-cols-[1.1fr_0.9fr]"
                >
                  <div className="p-8 md:p-10">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      <span>{post.category}</span>
                      <span className="h-1 w-1 bg-foreground" />
                      <span>{formatBlogDate(post.publishedAt)}</span>
                      <span className="h-1 w-1 bg-foreground" />
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="mt-5 text-3xl leading-tight">{post.title}</h3>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-muted md:text-base">
                      {post.excerpt}
                    </p>

                    <div className="mt-8">
                      <Link
                        href={getBlogPostPath(post.slug)}
                        className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
                      >
                        Read article
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-border bg-surface p-8 md:border-l md:border-t-0 md:p-10">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      What it covers
                    </div>
                    <div className="mt-5 grid gap-4">
                      {post.sections.slice(0, 3).map((section) => (
                        <div
                          key={section.title}
                          className="border border-border bg-background p-4"
                        >
                          <h4 className="text-lg leading-snug">{section.title}</h4>
                          <p className="mt-3 text-sm leading-6 text-muted">
                            {section.body[0]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
