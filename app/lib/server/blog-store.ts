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

// ─── Constants ───────────────────────────────────────────────────────────────

const BLOB_PATHNAME = "admin-blog-store.json";

const LOCAL_STORE_FILE = path.join(
  process.cwd(),
  "data",
  "admin-blog-store.json",
);

const TEMP_STORE_FILE = path.join(
  "/tmp",
  "accountsassists-admin-blog-store.json",
);

export type AdminBlogStoreSource = "file" | "seed";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortPosts(posts: ManagedBlogPost[]) {
  return [...posts].sort((a, b) => {
    const diff = toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt);
    if (diff !== 0) return diff;
    return toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt);
  });
}

function toPublicPost(post: ManagedBlogPost): BlogPost {
  return post;
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

// ─── Vercel Blob layer ────────────────────────────────────────────────────────

async function readBlobStore(): Promise<BlogAdminStore | null> {
  const { put, head, BlobNotFoundError } = await import("@vercel/blob");

  // head() returns blob metadata if the file exists, throws BlobNotFoundError otherwise
  let blobUrl: string;
  try {
    const meta = await head(BLOB_PATHNAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    blobUrl = meta.url;
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }

  // Fetch the actual JSON content via the blob's public URL
  const response = await fetch(blobUrl, { cache: "no-store" });
  if (!response.ok) return null;

  const raw = await response.text();
  try {
    return hydrateAdminStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeBlobStore(store: BlogAdminStore): Promise<void> {
  const { put } = await import("@vercel/blob");

  await put(BLOB_PATHNAME, JSON.stringify(store, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

// ─── Local filesystem layer (dev fallback) ────────────────────────────────────

async function readLocalStore(): Promise<BlogAdminStore | null> {
  for (const file of [LOCAL_STORE_FILE, TEMP_STORE_FILE]) {
    try {
      const raw = await readFile(file, "utf8");
      const store = hydrateAdminStore(JSON.parse(raw));
      if (store) return store;
    } catch {
      continue;
    }
  }
  return null;
}

async function writeLocalStore(store: BlogAdminStore): Promise<void> {
  let lastError: unknown = null;

  for (const file of [LOCAL_STORE_FILE, TEMP_STORE_FILE]) {
    try {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, `${JSON.stringify(store, null, 2)}\n`, "utf8");
      return;
    } catch (err) {
      lastError = err;
    }
  }

  const code =
    lastError && typeof lastError === "object" && "code" in lastError
      ? String((lastError as { code: unknown }).code)
      : "";

  if (code === "EROFS" || code === "EPERM" || code === "EACCES") {
    throw new Error(
      "This host cannot write blog changes to disk. Set BLOB_READ_WRITE_TOKEN to enable Vercel Blob storage.",
    );
  }

  throw new Error("Unable to save blog posts to disk.");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAdminBlogStore(): Promise<{
  store: BlogAdminStore;
  source: AdminBlogStoreSource;
}> {
  let store: BlogAdminStore | null = null;

  if (hasBlobToken()) {
    try {
      store = await readBlobStore();
    } catch (err) {
      console.error("[blog-store] Blob read failed:", err);
    }
  }

  // Fallback to local filesystem (works in dev without a token)
  if (!store) {
    store = await readLocalStore();
  }

  if (store) {
    return { store, source: "file" };
  }

  return { store: getSeedAdminStore(), source: "seed" };
}

export async function saveAdminBlogStore(store: BlogAdminStore): Promise<BlogAdminStore> {
  if (hasBlobToken()) {
    try {
      await writeBlobStore(store);
      console.log("[blog-store] Saved to Vercel Blob.");
      return store;
    } catch (err) {
      console.error("[blog-store] Blob write failed:", err);
      throw new Error(
        err instanceof Error
          ? `Blob storage error: ${err.message}`
          : "Unable to save blog posts to Vercel Blob.",
      );
    }
  }

  // Local dev: write to filesystem
  await writeLocalStore(store);
  console.log("[blog-store] Saved to local filesystem.");
  return store;
}

// ─── Public blog queries ──────────────────────────────────────────────────────

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
