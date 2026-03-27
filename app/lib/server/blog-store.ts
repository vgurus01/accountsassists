import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  getSeedAdminStore,
  hydrateAdminStore,
  type BlogAdminStore,
  type ManagedBlogPost,
} from "../admin-blog";
import type { BlogPost } from "../blog";

const DEFAULT_BLOG_STORE_FILE = path.join(
  process.cwd(),
  "data",
  "admin-blog-store.json",
);
const TEMP_BLOG_STORE_FILE = path.join(
  "/tmp",
  "accountsassists-admin-blog-store.json",
);

export type AdminBlogStoreSource = "file" | "seed";

function uniquePaths(paths: string[]) {
  return Array.from(new Set(paths.filter(Boolean)));
}

function getBlogStoreFiles() {
  return uniquePaths([
    process.env.BLOG_STORE_FILE_PATH?.trim() ?? "",
    DEFAULT_BLOG_STORE_FILE,
    TEMP_BLOG_STORE_FILE,
  ]);
}

function getPersistenceErrorMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  if (code === "EROFS" || code === "EPERM" || code === "EACCES") {
    return "This host cannot write blog changes to the current storage path.";
  }

  return "Unable to save blog posts to disk.";
}

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
  for (const file of getBlogStoreFiles()) {
    try {
      const raw = await readFile(file, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const store = hydrateAdminStore(parsed);

      if (store) {
        return store;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function getAdminBlogStore(): Promise<{
  store: BlogAdminStore;
  source: AdminBlogStoreSource;
}> {
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
  let lastError: unknown = null;

  for (const file of getBlogStoreFiles()) {
    try {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, `${JSON.stringify(store, null, 2)}\n`, "utf8");
      return store;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(getPersistenceErrorMessage(lastError));
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
