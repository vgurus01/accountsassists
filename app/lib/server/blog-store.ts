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
  const { get, BlobNotFoundError } = await import("@vercel/blob");

  const token = process.env.BLOB_READ_WRITE_TOKEN!;

  let result: Awaited<ReturnType<typeof get>>;
  try {
    result = await get(BLOB_PATHNAME, { access: "private", token });
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }

  // get() returns null on 404
  if (!result || result.statusCode === 304) return null;

  // Read the content from the ReadableStream
  try {
    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const raw = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array(0)),
    );
    return hydrateAdminStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeBlobStore(store: BlogAdminStore): Promise<void> {
  const { put } = await import("@vercel/blob");

  await put(BLOB_PATHNAME, JSON.stringify(store, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
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
