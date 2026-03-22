import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../sections/Footer";
import Header from "../../sections/Header";
import {
  BLOG_POSTS,
  formatBlogDate,
  getAbsoluteBlogPostUrl,
  getBlogPost,
  getBlogPostPath,
} from "../../lib/blog";
import {
  absoluteUrl,
  buildPageMetadata,
  getSiteUrl,
} from "../../lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog Article",
      description: "Article not found.",
    };
  }

  return buildPageMetadata({
    title: post.title,
    description: post.description,
    pathname: getBlogPostPath(post.slug),
    keywords: post.keywords,
    category: post.category,
    classification: "Accounting & Tax Article",
    openGraphType: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author],
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const articleBody = post.sections
    .flatMap((section) => [section.title, ...section.body])
    .join(" ");
  const wordCount = articleBody.split(/\s+/).filter(Boolean).length;

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${getAbsoluteBlogPostUrl(post.slug)}#article`,
    headline: post.title,
    description: post.description,
    articleSection: post.category,
    keywords: post.keywords,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "en-GB",
    wordCount,
    articleBody,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getAbsoluteBlogPostUrl(post.slug),
    },
    url: getAbsoluteBlogPostUrl(post.slug),
    isPartOf: {
      "@id": absoluteUrl("/blog/#blog"),
    },
    about: post.keywords,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@id": `${siteUrl}/#accountingservice`,
    },
    image: absoluteUrl("/opengraph-image"),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": getAbsoluteBlogPostUrl(post.slug),
    url: getAbsoluteBlogPostUrl(post.slug),
    name: post.title,
    description: post.description,
    inLanguage: "en-GB",
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    breadcrumb: {
      "@id": `${getAbsoluteBlogPostUrl(post.slug)}#breadcrumb`,
    },
    primaryImageOfPage: absoluteUrl("/opengraph-image"),
    mainEntity: {
      "@id": `${getAbsoluteBlogPostUrl(post.slug)}#article`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${getAbsoluteBlogPostUrl(post.slug)}#breadcrumb`,
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: getAbsoluteBlogPostUrl(post.slug),
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <article>
          <section className="border-b border-border bg-background">
            <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {post.category}
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl leading-[1.04] tracking-tight md:text-6xl">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted md:text-lg">
                {post.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                <span>{formatBlogDate(post.publishedAt)}</span>
                <span className="h-1 w-1 bg-foreground" />
                <span>Updated {formatBlogDate(post.updatedAt)}</span>
                <span className="h-1 w-1 bg-foreground" />
                <span>{post.readTime}</span>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {post.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="border border-border bg-surface p-5 text-sm leading-6"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-border bg-surface">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[0.72fr_1.28fr] md:py-24">
              <aside className="h-fit border border-border bg-background p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  In this article
                </div>
                <div className="mt-6 grid gap-3">
                  {post.sections.map((section, index) => (
                    <a
                      key={section.title}
                      href={`#section-${index + 1}`}
                      className="border border-border px-4 py-3 text-sm leading-6 transition-colors hover:bg-surface"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>

                <div className="mt-8 border-t border-border pt-8">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Need help filing?
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    If your records are messy or you want a second review before
                    submission, we can help you prepare the return accurately.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/#booking"
                      className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
                    >
                      Book a consultation
                    </Link>
                  </div>
                </div>
              </aside>

              <div className="grid gap-6">
                {post.sections.map((section, index) => (
                  <section
                    key={section.title}
                    id={`section-${index + 1}`}
                    className="border border-border bg-background p-8 md:p-10"
                  >
                    <h2 className="text-2xl leading-tight md:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-5 grid gap-4 text-sm leading-7 text-muted md:text-base">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-border bg-background">
            <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                FAQs
              </div>
              <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
                Quick answers before you file.
              </h2>

              <div className="mt-10 grid gap-4">
                {post.faq.map((item) => (
                  <div
                    key={item.question}
                    className="border border-border bg-surface p-6 md:p-8"
                  >
                    <h3 className="text-xl leading-snug">{item.question}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted md:text-base">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-surface">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-20 md:flex-row md:items-center md:justify-between md:py-24">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Continue reading
                </div>
                <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
                  Explore the blog or speak to an accountant directly.
                </h2>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Back to blog
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
                >
                  Contact Accounts Assists
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
