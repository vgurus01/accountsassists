import {
  BLOG_POSTS,
  type BlogPost,
  type BlogPostFaq,
  type BlogPostSection,
} from "./blog";

export const ADMIN_BLOG_STORAGE_KEY = "accountsassists-admin-blog-store-v2";
export const LEGACY_ADMIN_BLOG_STORAGE_KEY =
  "accountsassists-admin-blog-store-v1";

export type BlogStatus = "draft" | "published";

export type ManagedBlogSection = BlogPostSection & {
  id: string;
};

export type ManagedBlogFaq = BlogPostFaq & {
  id: string;
};

export type ManagedBlogPost = Omit<BlogPost, "sections" | "faq"> & {
  id: string;
  status: BlogStatus;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
  bodyHtml: string;
  sections: ManagedBlogSection[];
  faq: ManagedBlogFaq[];
};

export type BlogAdminStore = {
  posts: ManagedBlogPost[];
};

function stableId(...parts: string[]) {
  return parts.join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function asStringList(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string");
}

function mapSections(slug: string, sections: BlogPostSection[]) {
  return sections.map((section, index) => ({
    title: section.title,
    body: section.body,
    id: stableId(slug, "section", `${index + 1}`),
  }));
}

function mapFaq(slug: string, items: BlogPostFaq[]) {
  return items.map((item, index) => ({
    ...item,
    id: stableId(slug, "faq", `${index + 1}`),
  }));
}

function normalizeSections(slug: string, value: unknown) {
  if (!Array.isArray(value) || !value.length) {
    return [
      {
        id: stableId(slug, "section", "1"),
        title: "Main content",
        body: ["Start writing here."],
      },
    ];
  }

  return value.map((section, index) => {
    const rawSection =
      section && typeof section === "object"
        ? (section as Partial<ManagedBlogSection>)
        : {};

    return {
      id: asString(rawSection.id, stableId(slug, "section", `${index + 1}`)),
      title: asString(rawSection.title, `Section ${index + 1}`),
      body: asStringList(rawSection.body, []),
    };
  });
}

function normalizeFaq(slug: string, value: unknown) {
  if (!Array.isArray(value) || !value.length) {
    return [
      {
        id: stableId(slug, "faq", "1"),
        question: "What should this post answer clearly?",
        answer: "Add a short answer here.",
      },
    ];
  }

  return value.map((faq, index) => {
    const rawFaq =
      faq && typeof faq === "object" ? (faq as Partial<ManagedBlogFaq>) : {};

    return {
      id: asString(rawFaq.id, stableId(slug, "faq", `${index + 1}`)),
      question: asString(rawFaq.question, "New question"),
      answer: asString(rawFaq.answer, "Write a direct answer here."),
    };
  });
}

export function createBodyHtmlFromSections(sections: BlogPostSection[]) {
  return sections
    .map((section) => {
      const content: string[] = [];
      const title = section.title.trim() || "Main content";
      const bulletItems: string[] = [];

      const flushBulletItems = () => {
        if (!bulletItems.length) return;
        content.push(
          `<ul>${bulletItems
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}</ul>`,
        );
        bulletItems.length = 0;
      };

      for (const block of section.body) {
        const trimmed = block.trim();

        if (!trimmed) continue;

        if (trimmed.startsWith("• ")) {
          bulletItems.push(trimmed.replace(/^•\s+/, ""));
          continue;
        }

        flushBulletItems();
        content.push(`<p>${escapeHtml(trimmed)}</p>`);
      }

      flushBulletItems();

      return [`<h2>${escapeHtml(title)}</h2>`, ...content].join("");
    })
    .join("");
}

function asManagedBlogPost(post: BlogPost, index: number): ManagedBlogPost {
  const sections = mapSections(post.slug, post.sections);

  return {
    ...post,
    id: stableId(post.slug, "post", `${index + 1}`),
    status: "published",
    createdAt: `${post.publishedAt}T00:00:00.000Z`,
    seoTitle: post.title,
    seoDescription: post.description,
    bodyHtml: createBodyHtmlFromSections(sections),
    sections,
    faq: mapFaq(post.slug, post.faq),
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function hydrateManagedPost(
  value: unknown,
  index: number,
): ManagedBlogPost {
  const fallback = createEmptyManagedPost();
  const rawPost =
    value && typeof value === "object" ? (value as Partial<ManagedBlogPost>) : {};

  const title = asString(rawPost.title, fallback.title);
  const slug = slugify(asString(rawPost.slug, title)) || fallback.slug;
  const sections = normalizeSections(slug, rawPost.sections);
  const faq = normalizeFaq(slug, rawPost.faq);
  const description = asString(rawPost.description, fallback.description);
  const excerpt = asString(rawPost.excerpt, fallback.excerpt);

  return {
    ...fallback,
    id: asString(rawPost.id, stableId(slug, "post", `${index + 1}`)),
    slug,
    title,
    description,
    excerpt,
    category: asString(rawPost.category, fallback.category),
    readTime: asString(rawPost.readTime, fallback.readTime),
    publishedAt: asString(rawPost.publishedAt, fallback.publishedAt),
    updatedAt: asString(rawPost.updatedAt, fallback.updatedAt),
    author: asString(rawPost.author, fallback.author),
    keywords: asStringList(rawPost.keywords, []),
    highlights: asStringList(rawPost.highlights, fallback.highlights),
    seoTitle: asString(rawPost.seoTitle, title),
    seoDescription: asString(rawPost.seoDescription, description),
    status: rawPost.status === "published" ? "published" : "draft",
    createdAt: asString(rawPost.createdAt, fallback.createdAt),
    bodyHtml: asString(rawPost.bodyHtml, createBodyHtmlFromSections(sections)),
    sections,
    faq,
  };
}

export function hydrateAdminStore(value: unknown): BlogAdminStore | null {
  if (!value || typeof value !== "object") return null;

  const rawStore = value as { posts?: unknown };
  if (!Array.isArray(rawStore.posts)) return null;

  return {
    posts: rawStore.posts.map((post, index) => hydrateManagedPost(post, index)),
  };
}

export function getSeedAdminStore(): BlogAdminStore {
  return {
    posts: BLOG_POSTS.map(asManagedBlogPost),
  };
}

export function createEmptyManagedPost(): ManagedBlogPost {
  const now = new Date();
  const iso = now.toISOString();
  const date = iso.slice(0, 10);
  const slug = `untitled-${date}`;
  const sections = [
    {
      id: `${slug}-section-1`,
      title: "Main content",
      body: [
        "Start with a concise introduction.",
        "Use another paragraph to add context or practical detail.",
      ],
    },
  ];

  return {
    id: `draft-${now.getTime()}`,
    slug,
    title: "Untitled article",
    description: "Short search-focused summary for this article.",
    excerpt:
      "Use this area for a short summary that can appear in blog cards and previews.",
    category: "Self Assessment",
    readTime: "5 min read",
    publishedAt: date,
    updatedAt: date,
    author: "Accounts Assists",
    keywords: [],
    highlights: [
      "Lead with a useful takeaway.",
      "Keep the structure specific and practical.",
      "Add only the detail the reader actually needs.",
    ],
    seoTitle: "Untitled article",
    seoDescription: "Short search-focused summary for this article.",
    status: "draft",
    createdAt: iso,
    bodyHtml: createBodyHtmlFromSections(sections),
    sections,
    faq: [
      {
        id: `${slug}-faq-1`,
        question: "What should this article answer clearly?",
        answer: "Write one short answer that directly resolves the question.",
      },
    ],
  };
}
