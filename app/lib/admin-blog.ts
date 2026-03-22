import { BLOG_POSTS, type BlogPost, type BlogPostFaq, type BlogPostSection } from "./blog";

export const ADMIN_BLOG_STORAGE_KEY = "accountsassists-admin-blog-store-v1";

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
  targetLocations: string[];
  sections: ManagedBlogSection[];
  faq: ManagedBlogFaq[];
};

export type BlogActivityType =
  | "created"
  | "updated"
  | "published"
  | "duplicated"
  | "deleted"
  | "reset";

export type BlogActivity = {
  id: string;
  type: BlogActivityType;
  postId?: string;
  title: string;
  summary: string;
  happenedAt: string;
};

export type BlogAdminStore = {
  posts: ManagedBlogPost[];
  activities: BlogActivity[];
};

function stableId(...parts: string[]) {
  return parts.join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

function mapSections(slug: string, sections: BlogPostSection[]) {
  return sections.map((section, index) => ({
    ...section,
    id: stableId(slug, "section", `${index + 1}`),
  }));
}

function mapFaq(slug: string, items: BlogPostFaq[]) {
  return items.map((item, index) => ({
    ...item,
    id: stableId(slug, "faq", `${index + 1}`),
  }));
}

function asManagedBlogPost(post: BlogPost, index: number): ManagedBlogPost {
  return {
    ...post,
    id: stableId(post.slug, "post", `${index + 1}`),
    status: "published",
    createdAt: post.publishedAt,
    seoTitle: post.title,
    seoDescription: post.description,
    targetLocations: [],
    sections: mapSections(post.slug, post.sections),
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

export function getSeedAdminStore(): BlogAdminStore {
  return {
    posts: BLOG_POSTS.map(asManagedBlogPost),
    activities: [
      {
        id: "seed-activity",
        type: "reset",
        title: "Workspace seeded",
        summary: "Seeded the admin workspace from the current public blog content.",
        happenedAt: new Date().toISOString(),
      },
    ],
  };
}

export function createEmptyManagedPost(): ManagedBlogPost {
  const now = new Date();
  const iso = now.toISOString();
  const date = iso.slice(0, 10);
  const slug = `untitled-${date}`;

  return {
    id: `draft-${now.getTime()}`,
    slug,
    title: "Untitled article",
    description: "Short search-focused summary for this article.",
    excerpt: "Use this space for the opening summary that appears in the admin list and blog cards.",
    category: "Self Assessment",
    readTime: "5 min read",
    publishedAt: date,
    updatedAt: date,
    author: "Accounts Assists",
    keywords: [],
    highlights: [
      "Lead with a useful takeaway.",
      "Keep the structure practical and specific.",
      "Add local intent where it fits naturally.",
    ],
    seoTitle: "Untitled article",
    seoDescription: "Short search-focused summary for this article.",
    status: "draft",
    createdAt: iso,
    targetLocations: [],
    sections: [
      {
        id: `${slug}-section-1`,
        title: "1. Main section heading",
        body: [
          "Start with the first paragraph here.",
          "Use a second paragraph for detail, examples, or context.",
        ],
      },
    ],
    faq: [
      {
        id: `${slug}-faq-1`,
        question: "What should this article answer clearly?",
        answer: "Write one short answer that directly resolves the question.",
      },
    ],
  };
}
