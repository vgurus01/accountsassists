import type { MetadataRoute } from "next";
import { BLOG_POSTS, getBlogPostPath } from "./lib/blog";
import { getSiteUrl } from "./lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${siteUrl}${getBlogPostPath(post.slug)}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
