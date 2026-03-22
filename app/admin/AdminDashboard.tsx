"use client";

import Link from "next/link";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ADMIN_BLOG_STORAGE_KEY,
  createEmptyManagedPost,
  getSeedAdminStore,
  slugify,
  type BlogActivity,
  type BlogActivityType,
  type BlogAdminStore,
  type ManagedBlogFaq,
  type ManagedBlogPost,
  type ManagedBlogSection,
} from "../lib/admin-blog";

type StatusFilter = "all" | "published" | "draft";

const STATUS_OPTIONS: StatusFilter[] = ["all", "published", "draft"];

function loadAdminStore() {
  if (typeof window === "undefined") return getSeedAdminStore();

  try {
    const raw = window.localStorage.getItem(ADMIN_BLOG_STORAGE_KEY);
    if (!raw) return getSeedAdminStore();
    const parsed = JSON.parse(raw) as BlogAdminStore;
    if (!Array.isArray(parsed.posts) || !Array.isArray(parsed.activities)) {
      return getSeedAdminStore();
    }
    return parsed;
  } catch {
    return getSeedAdminStore();
  }
}

function saveAdminStore(store: BlogAdminStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_BLOG_STORAGE_KEY, JSON.stringify(store));
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTimeLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function relativeTimeLabel(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(values: string[]) {
  return values.join("\n");
}

function createActivity(
  type: BlogActivityType,
  title: string,
  summary: string,
  postId?: string,
): BlogActivity {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    postId,
    title,
    summary,
    happenedAt: new Date().toISOString(),
  };
}

function applyActivity(store: BlogAdminStore, activity: BlogActivity) {
  return {
    ...store,
    activities: [activity, ...store.activities].slice(0, 80),
  };
}

function computeSeoChecklist(post: ManagedBlogPost) {
  const titleLength = post.seoTitle.trim().length;
  const descriptionLength = post.seoDescription.trim().length;

  return [
    {
      label: "SEO title is filled and readable",
      pass: titleLength >= 35 && titleLength <= 65,
    },
    {
      label: "Meta description is in a good range",
      pass: descriptionLength >= 120 && descriptionLength <= 170,
    },
    {
      label: "Slug is clean and URL-safe",
      pass: !!post.slug && !post.slug.includes(" "),
    },
    {
      label: "Keywords are specific enough",
      pass: post.keywords.length >= 5,
    },
    {
      label: "Article has useful depth",
      pass: post.sections.length >= 3,
    },
    {
      label: "FAQ helps long-tail search intent",
      pass: post.faq.length >= 1,
    },
    {
      label: "Target locations are set",
      pass: post.targetLocations.length >= 1,
    },
  ];
}

function getWordCount(post: ManagedBlogPost) {
  return post.sections
    .flatMap((section) => [section.title, ...section.body])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function createDuplicateSlug(slug: string, posts: ManagedBlogPost[]) {
  const base = slugify(slug) || "untitled-post";
  if (!posts.some((post) => post.slug === base)) return base;

  let suffix = 2;
  while (posts.some((post) => post.slug === `${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export default function AdminDashboard({ login }: { login: string }) {
  const [store, setStore] = useState<BlogAdminStore>(loadAdminStore);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    saveAdminStore(store);
  }, [store]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = () => {
      const nextStore = loadAdminStore();
      setStore(nextStore);
      setSelectedId((current) => {
        if (current && nextStore.posts.some((post) => post.id === current)) {
          return current;
        }
        return nextStore.posts[0]?.id ?? null;
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sortedPosts = useMemo(
    () =>
      [...store.posts].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [store.posts],
  );

  const filteredPosts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return sortedPosts.filter((post) => {
      if (filter !== "all" && post.status !== filter) return false;
      if (!query) return true;
      return [
        post.title,
        post.slug,
        post.category,
        post.description,
        ...post.keywords,
        ...post.targetLocations,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [deferredSearch, filter, sortedPosts]);

  const activeSelectedId =
    selectedId && filteredPosts.some((post) => post.id === selectedId)
      ? selectedId
      : filteredPosts[0]?.id ?? null;

  const selectedPost =
    sortedPosts.find((post) => post.id === activeSelectedId) ?? null;

  const seoChecklist = useMemo(
    () => (selectedPost ? computeSeoChecklist(selectedPost) : []),
    [selectedPost],
  );

  const seoScore = useMemo(() => {
    if (!seoChecklist.length) return 0;
    const passed = seoChecklist.filter((item) => item.pass).length;
    return Math.round((passed / seoChecklist.length) * 100);
  }, [seoChecklist]);

  const stats = useMemo(() => {
    const publishedCount = store.posts.filter((post) => post.status === "published").length;
    const draftCount = store.posts.filter((post) => post.status === "draft").length;
    const words = store.posts.reduce((sum, post) => sum + getWordCount(post), 0);

    return {
      total: store.posts.length,
      published: publishedCount,
      drafts: draftCount,
      activity: store.activities.length,
      words,
    };
  }, [store.activities.length, store.posts]);

  function replaceSelectedPost(
    updater: (post: ManagedBlogPost) => ManagedBlogPost,
    activity?: (post: ManagedBlogPost) => BlogActivity,
  ) {
    if (!selectedPost) return;

    setStore((current) => {
      const posts = current.posts.map((post) =>
        post.id === selectedPost.id ? updater(post) : post,
      );
      const updatedPost = posts.find((post) => post.id === selectedPost.id);
      if (!updatedPost) return current;
      const nextStore = { ...current, posts };
      return activity ? applyActivity(nextStore, activity(updatedPost)) : nextStore;
    });
  }

  function updateTitle(value: string) {
    if (!selectedPost) return;
    const currentSlug = selectedPost.slug;
    const generatedFromOldTitle = slugify(selectedPost.title);
    const generatedFromNewTitle = slugify(value) || currentSlug;

    replaceSelectedPost((post) => ({
      ...post,
      title: value,
      seoTitle: post.seoTitle === selectedPost.title ? value : post.seoTitle,
      slug:
        !post.slug || post.slug === generatedFromOldTitle ? generatedFromNewTitle : post.slug,
    }));
  }

  function updateSimpleField<K extends keyof ManagedBlogPost>(
    key: K,
    value: ManagedBlogPost[K],
  ) {
    replaceSelectedPost((post) => ({ ...post, [key]: value }));
  }

  function updateSection(
    sectionId: string,
    field: keyof ManagedBlogSection,
    value: string,
  ) {
    replaceSelectedPost((post) => ({
      ...post,
      sections: post.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              [field]:
                field === "body" ? value.split("\n\n").map((line) => line.trim()).filter(Boolean) : value,
            }
          : section,
      ),
    }));
  }

  function addSection() {
    replaceSelectedPost((post) => ({
      ...post,
      sections: [
        ...post.sections,
        {
          id: `${post.slug || "post"}-section-${post.sections.length + 1}-${Date.now()}`,
          title: `${post.sections.length + 1}. New section`,
          body: ["Add a clear paragraph here."],
        },
      ],
    }));
  }

  function removeSection(sectionId: string) {
    if (!selectedPost || selectedPost.sections.length === 1) return;
    replaceSelectedPost((post) => ({
      ...post,
      sections: post.sections.filter((section) => section.id !== sectionId),
    }));
  }

  function updateFaq(
    faqId: string,
    field: keyof ManagedBlogFaq,
    value: string,
  ) {
    replaceSelectedPost((post) => ({
      ...post,
      faq: post.faq.map((faq) =>
        faq.id === faqId ? { ...faq, [field]: value } : faq,
      ),
    }));
  }

  function addFaq() {
    replaceSelectedPost((post) => ({
      ...post,
      faq: [
        ...post.faq,
        {
          id: `${post.slug || "post"}-faq-${post.faq.length + 1}-${Date.now()}`,
          question: "New question",
          answer: "Write a short, direct answer.",
        },
      ],
    }));
  }

  function removeFaq(faqId: string) {
    if (!selectedPost || selectedPost.faq.length === 1) return;
    replaceSelectedPost((post) => ({
      ...post,
      faq: post.faq.filter((item) => item.id !== faqId),
    }));
  }

  function createPost() {
    const blankPost = createEmptyManagedPost();
    setStore((current) =>
      applyActivity(
        {
          ...current,
          posts: [blankPost, ...current.posts],
        },
        createActivity(
          "created",
          "Draft created",
          `Opened a new draft workspace for ${blankPost.title}.`,
          blankPost.id,
        ),
      ),
    );
    setFilter("all");
    setSearch("");
    startTransition(() => setSelectedId(blankPost.id));
  }

  function duplicatePost() {
    if (!selectedPost) return;

    const now = new Date().toISOString();
    const duplicateSlug = createDuplicateSlug(selectedPost.slug, store.posts);
    const duplicate: ManagedBlogPost = {
      ...selectedPost,
      id: `${selectedPost.id}-copy-${Date.now()}`,
      title: `${selectedPost.title} Copy`,
      slug: duplicateSlug,
      status: "draft",
      createdAt: now,
      updatedAt: now.slice(0, 10),
      publishedAt: now.slice(0, 10),
      sections: selectedPost.sections.map((section, index) => ({
        ...section,
        id: `${duplicateSlug}-section-${index + 1}`,
      })),
      faq: selectedPost.faq.map((item, index) => ({
        ...item,
        id: `${duplicateSlug}-faq-${index + 1}`,
      })),
    };

    setStore((current) =>
      applyActivity(
        {
          ...current,
          posts: [duplicate, ...current.posts],
        },
        createActivity(
          "duplicated",
          "Post duplicated",
          `Created a draft copy of ${selectedPost.title}.`,
          duplicate.id,
        ),
      ),
    );
    setFilter("all");
    setSearch("");
    startTransition(() => setSelectedId(duplicate.id));
  }

  function saveDraft() {
    if (!selectedPost) return;

    replaceSelectedPost(
      (post) => ({
        ...post,
        status: "draft",
        updatedAt: new Date().toISOString().slice(0, 10),
      }),
      (post) =>
        createActivity(
          "updated",
          "Draft saved",
          `Saved ${post.title} as a draft.`,
          post.id,
        ),
    );
  }

  function publishPost() {
    if (!selectedPost) return;

    replaceSelectedPost(
      (post) => ({
        ...post,
        status: "published",
        publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      }),
      (post) =>
        createActivity(
          "published",
          "Post marked published",
          `Updated ${post.title} to published status.`,
          post.id,
        ),
    );
  }

  function deletePost() {
    if (!selectedPost) return;
    if (store.posts.length === 1) return;
    if (!window.confirm(`Delete "${selectedPost.title}" from this admin workspace?`)) {
      return;
    }

    const deletedId = selectedPost.id;
    const deletedTitle = selectedPost.title;

    setStore((current) =>
      applyActivity(
        {
          ...current,
          posts: current.posts.filter((post) => post.id !== deletedId),
        },
        createActivity(
          "deleted",
          "Post removed",
          `Removed ${deletedTitle} from this workspace.`,
          deletedId,
        ),
      ),
    );

    startTransition(() => {
      const nextPost = filteredPosts.find((post) => post.id !== deletedId) ?? store.posts.find((post) => post.id !== deletedId);
      setSelectedId(nextPost?.id ?? null);
    });
  }

  function resetWorkspace() {
    if (!window.confirm("Reset the admin workspace back to the seeded blog content?")) {
      return;
    }

    const nextStore = applyActivity(
      getSeedAdminStore(),
      createActivity(
        "reset",
        "Workspace reset",
        "Reset the admin workspace to the seeded public blog content.",
      ),
    );

    setStore(nextStore);
    setSelectedId(nextStore.posts[0]?.id ?? null);
  }

  function exportWorkspace() {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `accountsassists-admin-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setLoggingOut(false);
        return;
      }

      window.location.href = "/admin/login";
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground admin-grid-bg">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              <span className="h-2 w-2 bg-foreground" />
              Admin workspace
            </div>
            <div>
              <h1 className="text-4xl leading-[1.02] tracking-tight md:text-6xl">
                Blog control
                <br />
                built for managers.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
                Create articles, refine SEO fields, track status changes, and
                keep a clean activity trail from one dashboard.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[23rem]">
            <div className="border border-border bg-surface p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Storage
              </div>
              <div className="mt-3 text-sm leading-6">
                Browser workspace active
              </div>
              <div className="mt-2 text-xs leading-5 text-muted">
                Posts and activity are saved in this browser. Wire a database
                next if you want shared live publishing.
              </div>
            </div>
            <div className="border border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Session
              </div>
              <div className="mt-3 text-sm leading-6">
                Signed in as <span className="font-semibold">{login}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center border border-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                >
                  Visit blog
                </Link>
                <button
                  type="button"
                  onClick={exportWorkspace}
                  className="inline-flex items-center justify-center bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-background hover:bg-foreground/90"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={logout}
                  disabled={loggingOut}
                  className="inline-flex items-center justify-center border border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? "Signing out..." : "Log out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[17rem_minmax(0,1fr)_20rem]">
        <aside className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="border border-border bg-background p-5 admin-panel">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Total posts
              </div>
              <div className="mt-4 text-4xl leading-none">{stats.total}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.22em] text-muted">
                {stats.words.toLocaleString()} words managed
              </div>
            </div>
            <div className="border border-border bg-surface p-5 admin-panel">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Published
              </div>
              <div className="mt-4 text-4xl leading-none">{stats.published}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.22em] text-muted">
                {stats.drafts} drafts in queue
              </div>
            </div>
            <div className="border border-border bg-surface p-5 admin-panel">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Activity
              </div>
              <div className="mt-4 text-4xl leading-none">{stats.activity}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.22em] text-muted">
                Manager actions tracked
              </div>
            </div>
          </div>

          <div className="border border-border bg-background">
            <div className="border-b border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Post library
                  </div>
                  <div className="mt-2 text-lg">Search, filter, and switch.</div>
                </div>
                <button
                  type="button"
                  onClick={createPost}
                  className="inline-flex items-center justify-center bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-background hover:bg-foreground/90"
                >
                  New post
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-5">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, slug, keyword, or area"
                className="border border-border bg-surface px-4 py-3 text-sm"
              />

              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={[
                      "border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]",
                      filter === option
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                {filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedId(post.id)}
                    className={[
                      "border p-4 text-left transition-colors",
                      selectedPost?.id === post.id
                        ? "border-foreground bg-surface"
                        : "border-border bg-background hover:bg-surface",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          {post.category}
                        </div>
                        <div className="mt-2 text-lg leading-snug">{post.title}</div>
                      </div>
                      <div
                        className={[
                          "border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                          post.status === "published"
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted",
                        ].join(" ")}
                      >
                        {post.status}
                      </div>
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                      {post.slug}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted">
                      <span>{post.readTime}</span>
                      <span>{relativeTimeLabel(post.updatedAt)}</span>
                    </div>
                  </button>
                ))}

                {!filteredPosts.length ? (
                  <div className="border border-dashed border-border bg-surface p-6 text-sm text-muted">
                    No posts match the current search or filter.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {selectedPost ? (
            <>
              <div className="border border-border bg-background admin-spotlight">
                <div className="flex flex-col gap-6 border-b border-border p-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      Editing
                    </div>
                    <div className="mt-3 text-3xl leading-tight md:text-4xl">
                      {selectedPost.title}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      <span>{selectedPost.slug}</span>
                      <span className="h-1 w-1 self-center bg-foreground" />
                      <span>Updated {formatDateLabel(selectedPost.updatedAt)}</span>
                      <span className="h-1 w-1 self-center bg-foreground" />
                      <span>{selectedPost.status}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={duplicatePost}
                      className="inline-flex items-center justify-center border border-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="inline-flex items-center justify-center border border-border bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-foreground hover:border-foreground"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={publishPost}
                      className="inline-flex items-center justify-center bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-background hover:bg-foreground/90"
                    >
                      Publish
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 p-6 xl:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      Article title
                    </span>
                    <input
                      value={selectedPost.title}
                      onChange={(event) => updateTitle(event.target.value)}
                      className="border border-border bg-background px-4 py-3 text-sm"
                    />
                  </label>

                  <div className="grid gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      Slug
                    </div>
                    <div className="flex gap-3">
                      <input
                        value={selectedPost.slug}
                        onChange={(event) =>
                          updateSimpleField("slug", slugify(event.target.value))
                        }
                        className="min-w-0 flex-1 border border-border bg-background px-4 py-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateSimpleField("slug", slugify(selectedPost.title))
                        }
                        className="border border-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="border border-border bg-background p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Article details
                  </div>
                  <div className="mt-6 grid gap-5">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Category
                      </span>
                      <input
                        value={selectedPost.category}
                        onChange={(event) =>
                          updateSimpleField("category", event.target.value)
                        }
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                    </label>

                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          Read time
                        </span>
                        <input
                          value={selectedPost.readTime}
                          onChange={(event) =>
                            updateSimpleField("readTime", event.target.value)
                          }
                          className="border border-border bg-surface px-4 py-3 text-sm"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          Author
                        </span>
                        <input
                          value={selectedPost.author}
                          onChange={(event) =>
                            updateSimpleField("author", event.target.value)
                          }
                          className="border border-border bg-surface px-4 py-3 text-sm"
                        />
                      </label>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          Published date
                        </span>
                        <input
                          type="date"
                          value={selectedPost.publishedAt}
                          onChange={(event) =>
                            updateSimpleField("publishedAt", event.target.value)
                          }
                          className="border border-border bg-surface px-4 py-3 text-sm"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          Status
                        </span>
                        <select
                          value={selectedPost.status}
                          onChange={(event) =>
                            updateSimpleField(
                              "status",
                              event.target.value as ManagedBlogPost["status"],
                            )
                          }
                          className="border border-border bg-surface px-4 py-3 text-sm"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </label>
                    </div>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Card excerpt
                      </span>
                      <textarea
                        value={selectedPost.excerpt}
                        onChange={(event) =>
                          updateSimpleField("excerpt", event.target.value)
                        }
                        rows={4}
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Article description
                      </span>
                      <textarea
                        value={selectedPost.description}
                        onChange={(event) =>
                          updateSimpleField("description", event.target.value)
                        }
                        rows={5}
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                    </label>
                  </div>
                </div>

                <div className="border border-border bg-background p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    SEO & targeting
                  </div>
                  <div className="mt-6 grid gap-5">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        SEO title
                      </span>
                      <input
                        value={selectedPost.seoTitle}
                        onChange={(event) =>
                          updateSimpleField("seoTitle", event.target.value)
                        }
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Meta description
                      </span>
                      <textarea
                        value={selectedPost.seoDescription}
                        onChange={(event) =>
                          updateSimpleField("seoDescription", event.target.value)
                        }
                        rows={4}
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Keywords
                      </span>
                      <textarea
                        value={listToLines(selectedPost.keywords)}
                        onChange={(event) =>
                          updateSimpleField("keywords", linesToList(event.target.value))
                        }
                        rows={6}
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                      <div className="text-xs text-muted">
                        One phrase per line.
                      </div>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Target locations
                      </span>
                      <textarea
                        value={listToLines(selectedPost.targetLocations)}
                        onChange={(event) =>
                          updateSimpleField(
                            "targetLocations",
                            linesToList(event.target.value),
                          )
                        }
                        rows={5}
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                      <div className="text-xs text-muted">
                        Use one location per line for local intent.
                      </div>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Highlights
                      </span>
                      <textarea
                        value={listToLines(selectedPost.highlights)}
                        onChange={(event) =>
                          updateSimpleField(
                            "highlights",
                            linesToList(event.target.value),
                          )
                        }
                        rows={5}
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="border border-border bg-background p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      Article structure
                    </div>
                    <div className="mt-2 text-lg">
                      Build the main body section by section.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addSection}
                    className="border border-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                  >
                    Add section
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  {selectedPost.sections.map((section) => (
                    <div key={section.id} className="border border-border bg-surface p-5">
                      <div className="flex items-start justify-between gap-4">
                        <label className="grid flex-1 gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                            Section title
                          </span>
                          <input
                            value={section.title}
                            onChange={(event) =>
                              updateSection(section.id, "title", event.target.value)
                            }
                            className="border border-border bg-background px-4 py-3 text-sm"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSection(section.id)}
                          disabled={selectedPost.sections.length === 1}
                          className="border border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>

                      <label className="mt-4 grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          Paragraphs
                        </span>
                        <textarea
                          value={section.body.join("\n\n")}
                          onChange={(event) =>
                            updateSection(section.id, "body", event.target.value)
                          }
                          rows={8}
                          className="border border-border bg-background px-4 py-3 text-sm"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border bg-background p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      FAQs
                    </div>
                    <div className="mt-2 text-lg">
                      Keep long-tail questions explicit and direct.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="border border-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                  >
                    Add FAQ
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  {selectedPost.faq.map((item) => (
                    <div key={item.id} className="border border-border bg-surface p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid flex-1 gap-4">
                          <label className="grid gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                              Question
                            </span>
                            <input
                              value={item.question}
                              onChange={(event) =>
                                updateFaq(item.id, "question", event.target.value)
                              }
                              className="border border-border bg-background px-4 py-3 text-sm"
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                              Answer
                            </span>
                            <textarea
                              value={item.answer}
                              onChange={(event) =>
                                updateFaq(item.id, "answer", event.target.value)
                              }
                              rows={4}
                              className="border border-border bg-background px-4 py-3 text-sm"
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(item.id)}
                          disabled={selectedPost.faq.length === 1}
                          className="border border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-border bg-background p-10 text-sm text-muted">
              No post selected yet.
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="border border-border bg-background p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Tracking
            </div>
            {selectedPost ? (
              <div className="mt-5 grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-border bg-surface p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      Word count
                    </div>
                    <div className="mt-3 text-2xl leading-none">
                      {getWordCount(selectedPost)}
                    </div>
                  </div>
                  <div className="border border-border bg-surface p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      SEO score
                    </div>
                    <div className="mt-3 text-2xl leading-none">{seoScore}%</div>
                  </div>
                </div>

                <div className="border border-border bg-surface p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Public path
                  </div>
                  <div className="mt-3 text-sm leading-6">
                    <code>/blog/{selectedPost.slug}</code>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/blog/${selectedPost.slug}`}
                      className="inline-flex items-center justify-center border border-foreground px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                    >
                      Open route
                    </Link>
                    <button
                      type="button"
                      onClick={deletePost}
                      disabled={store.posts.length === 1}
                      className="inline-flex items-center justify-center border border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border border-border bg-surface p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Readiness checklist
                  </div>
                  <div className="mt-4 grid gap-3">
                    {seoChecklist.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 text-sm leading-6"
                      >
                        <span
                          className={[
                            "mt-2 h-2 w-2 shrink-0",
                            item.pass ? "bg-foreground" : "border border-border bg-background",
                          ].join(" ")}
                        />
                        <span className={item.pass ? "text-foreground" : "text-muted"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border bg-surface p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Snapshot
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-muted">
                    <div className="flex items-center justify-between gap-3">
                      <span>Created</span>
                      <span>{formatDateTimeLabel(selectedPost.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Published</span>
                      <span>{formatDateLabel(selectedPost.publishedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Sections</span>
                      <span>{selectedPost.sections.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>FAQs</span>
                      <span>{selectedPost.faq.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Locations</span>
                      <span>{selectedPost.targetLocations.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border border-border bg-background">
            <div className="flex items-center justify-between gap-3 border-b border-border p-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Activity log
                </div>
                <div className="mt-2 text-lg">Track manager actions.</div>
              </div>
              <button
                type="button"
                onClick={resetWorkspace}
                className="border border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted"
              >
                Reset
              </button>
            </div>

            <div className="grid gap-3 p-5">
              {store.activities.map((activity) => (
                <div key={activity.id} className="border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                      {activity.type}
                    </div>
                    <div className="text-xs text-muted">
                      {relativeTimeLabel(activity.happenedAt)}
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-6">{activity.title}</div>
                  <div className="mt-2 text-xs leading-5 text-muted">
                    {activity.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
