import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import {
  getSeedAdminStore,
  hydrateAdminStore,
  type BlogAdminStore,
  type ManagedBlogPost,
} from "../admin-blog";
import type { BlogPost } from "../blog";

const BLOG_STORE_FILE = path.join(process.cwd(), "data", "admin-blog-store.json");

export type AdminBlogStoreSource = "file" | "seed";

function toTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortPosts(posts: ManagedBlogPost[]) {
  return [...posts].sort((firstPost, secondPost) => {
    const publishedDifference =
      toTimestamp(secondPost.publishedAt) - toTimestamp(firstPost.publishedAt);

    if (publishedDifference !== 0) {
      return publishedDifference;
    }

    return toTimestamp(secondPost.updatedAt) - toTimestamp(firstPost.updatedAt);
  });
}

function toPublicPost(post: ManagedBlogPost): BlogPost {
  return post;
}

async function readPersistedStore() {
  try {
    const raw = await readFile(BLOG_STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return hydrateAdminStore(parsed);
  } catch {
    return null;
  }
}

export async function getAdminBlogStore(): Promise<{
  store: BlogAdminStore;
  source: AdminBlogStoreSource;
}> {
  noStore();

  const persistedStore = await readPersistedStore();

  if (persistedStore) {
    return {
      store: persistedStore,
      source: "file",
    };
  }

  return {
    store: getSeedAdminStore(),
    source: "seed",
  };
}

export async function saveAdminBlogStore(store: BlogAdminStore) {
  await mkdir(path.dirname(BLOG_STORE_FILE), { recursive: true });
  await writeFile(BLOG_STORE_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");

  return store;
}

export async function getPublishedBlogPosts() {
  const { store } = await getAdminBlogStore();

  return sortPosts(
    store.posts.filter((post) => post.status === "published"),
  ).map(toPublicPost);
}

export async function getPublishedBlogPost(slug: string) {
  const posts = await getPublishedBlogPosts();
  return posts.find((post) => post.slug === slug);
}
