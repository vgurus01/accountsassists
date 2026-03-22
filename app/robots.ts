import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).host;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host,
  };
}
