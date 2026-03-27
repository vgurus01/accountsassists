"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ADMIN_BLOG_STORAGE_KEY,
  LEGACY_ADMIN_BLOG_STORAGE_KEY,
  createEmptyManagedPost,
  getSeedAdminStore,
  hydrateAdminStore,
  slugify,
  type BlogAdminStore,
  type BlogStatus,
  type ManagedBlogFaq,
  type ManagedBlogPost,
  type ManagedBlogSection,
} from "../lib/admin-blog";

const DEFAULT_CATEGORIES = [
  "Self Assessment",
  "Bookkeeping",
  "Tax Planning",
  "VAT",
  "Payroll",
  "Business Advice",
];

const PANEL_CLASS = "rounded-xl border border-gray-200 bg-white shadow-sm";
const SECTION_CLASS = "rounded-xl border border-gray-200 bg-gray-50";
const LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-[0.22em] text-gray-500";
const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50";
const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100";
const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100";
const DANGER_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100";
const ICON_DANGER_BUTTON_CLASS =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100";

function formatDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function linesToList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToLines(values: string[]) {
  return values.join("\n");
}

function isEditorHtmlEmpty(value: string) {
  return !value
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function bodyHtmlToSections(
  value: string,
  slug: string,
): ManagedBlogSection[] {
  if (typeof window === "undefined") {
    return [
      {
        id: `${slug}-section-1`,
        title: "Main content",
        body: [],
      },
    ];
  }

  const documentFragment = new DOMParser().parseFromString(value, "text/html");
  const sections: Array<{ title: string; body: string[] }> = [];
  let currentSection: { title: string; body: string[] } | null = null;

  const ensureSection = () => {
    if (!currentSection) {
      currentSection = {
        title: sections.length === 0 ? "Main content" : `Section ${sections.length + 1}`,
        body: [],
      };
    }

    return currentSection;
  };

  const commitSection = () => {
    if (!currentSection) return;

    const body = currentSection.body.map(normalizeWhitespace).filter(Boolean);
    const title = normalizeWhitespace(currentSection.title) || "Main content";

    if (body.length || title) {
      sections.push({ title, body });
    }

    currentSection = null;
  };

  const addParagraph = (text: string) => {
    const normalized = normalizeWhitespace(text);
    if (!normalized) return;
    ensureSection().body.push(normalized);
  };

  const visitNodes = (nodes: ChildNode[]) => {
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        addParagraph(node.textContent ?? "");
        continue;
      }

      if (!(node instanceof HTMLElement)) {
        continue;
      }

      const tag = node.tagName.toUpperCase();

      if (/^H[1-6]$/.test(tag)) {
        commitSection();
        currentSection = {
          title: normalizeWhitespace(node.textContent ?? "") || `Section ${sections.length + 1}`,
          body: [],
        };
        continue;
      }

      if (tag === "UL" || tag === "OL") {
        for (const item of Array.from(node.children)) {
          addParagraph(`• ${item.textContent ?? ""}`);
        }
        continue;
      }

      if (tag === "P" || tag === "BLOCKQUOTE" || tag === "LI") {
        addParagraph(node.textContent ?? "");
        continue;
      }

      if (tag === "BR") {
        continue;
      }

      const hasStructuredChildren = Array.from(node.children).some((child) =>
        /^(H[1-6]|UL|OL|P|DIV|BLOCKQUOTE|SECTION|ARTICLE)$/.test(
          child.tagName.toUpperCase(),
        ),
      );

      if (hasStructuredChildren) {
        visitNodes(Array.from(node.childNodes));
        continue;
      }

      addParagraph(node.textContent ?? "");
    }
  };

  visitNodes(Array.from(documentFragment.body.childNodes));
  commitSection();

  if (!sections.length) {
    return [
      {
        id: `${slug}-section-1`,
        title: "Main content",
        body: [],
      },
    ];
  }

  return sections.map((section, index) => ({
    id: `${slug}-section-${index + 1}`,
    title: section.title,
    body: section.body,
  }));
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M10 3h4" strokeLinecap="round" />
      <path d="M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5" strokeLinecap="round" />
      <path d="M14 11v5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        status === "published"
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-amber-200 bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

type PostCardProps = {
  post: ManagedBlogPost;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

function PostCard({ post, isActive, onSelect, onDelete }: PostCardProps) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={[
        "cursor-pointer rounded-xl border p-4 text-left transition-colors",
        isActive
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-200 bg-gray-50 hover:border-emerald-200 hover:bg-emerald-50/40",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">
            {post.title}
          </p>
        </div>
        <StatusBadge status={post.status} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
          {post.category}
        </span>
        <span className="text-xs text-gray-500">
          {formatDateLabel(post.publishedAt)}
        </span>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          aria-label={`Delete ${post.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className={ICON_DANGER_BUTTON_CLASS}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

type ToolbarButtonProps = {
  label: string;
  title: string;
  onClick: () => void;
};

function ToolbarButton({ label, title, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100"
    >
      {label}
    </button>
  );
}

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(isEditorHtmlEmpty(value));

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === value) return;

    editorRef.current.innerHTML = value;
  }, [value]);

  function emitChange() {
    const nextValue = editorRef.current?.innerHTML ?? "";
    setIsEmpty(isEditorHtmlEmpty(nextValue));
    onChange(nextValue);
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <ToolbarButton
          label="B"
          title="Bold"
          onClick={() => runCommand("bold")}
        />
        <ToolbarButton
          label="I"
          title="Italic"
          onClick={() => runCommand("italic")}
        />
        <ToolbarButton
          label="H2"
          title="Heading 2"
          onClick={() => runCommand("formatBlock", "H2")}
        />
        <ToolbarButton
          label="H3"
          title="Heading 3"
          onClick={() => runCommand("formatBlock", "H3")}
        />
        <ToolbarButton
          label="• List"
          title="Bulleted list"
          onClick={() => runCommand("insertUnorderedList")}
        />
      </div>

      <div className="relative">
        {isEmpty ? (
          <span className="pointer-events-none absolute left-4 top-4 text-sm text-gray-400">
            Start writing the article body...
          </span>
        ) : null}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            emitChange();
          }}
          className="min-h-[24rem] rounded-xl border border-gray-200 bg-white px-4 py-4 text-base leading-7 text-gray-800 outline-none transition-colors focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:space-y-2"
        />
      </div>
    </div>
  );
}

type LocalStoreState = {
  store: BlogAdminStore;
  source: "local" | "seed";
};

type RemoteStoreState = {
  store: BlogAdminStore;
  source: "file" | "seed";
};

function serializeStore(store: BlogAdminStore) {
  return JSON.stringify(store);
}

function loadLocalAdminStore(): LocalStoreState {
  if (typeof window === "undefined") {
    return {
      store: getSeedAdminStore(),
      source: "seed",
    };
  }

  for (const key of [ADMIN_BLOG_STORAGE_KEY, LEGACY_ADMIN_BLOG_STORAGE_KEY]) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const hydrated = hydrateAdminStore(parsed);

      if (hydrated) {
        return {
          store: hydrated,
          source: "local",
        };
      }
    } catch {
      continue;
    }
  }

  return {
    store: getSeedAdminStore(),
    source: "seed",
  };
}

function saveLocalAdminStore(store: BlogAdminStore) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ADMIN_BLOG_STORAGE_KEY, JSON.stringify(store));
}

async function readStoreResponse(response: Response) {
  const payload = (await response.json()) as
    | RemoteStoreState
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in payload && payload.error
        ? payload.error
        : "Unable to sync blog posts.",
    );
  }

  return payload as RemoteStoreState;
}

async function fetchRemoteAdminStore() {
  const response = await fetch("/api/admin/posts", {
    cache: "no-store",
    credentials: "same-origin",
  });

  return readStoreResponse(response);
}

async function saveRemoteAdminStore(store: BlogAdminStore) {
  const response = await fetch("/api/admin/posts", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(store),
  });

  return readStoreResponse(response);
}

export default function AdminDashboard() {
  const [initialLocalState] = useState<LocalStoreState>(loadLocalAdminStore);
  const [store, setStore] = useState<BlogAdminStore>(initialLocalState.store);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isRemoteStoreReady, setIsRemoteStoreReady] = useState(false);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "loading" | "saving" | "saved" | "error"
  >("loading");
  const deferredSearch = useDeferredValue(search);
  const lastSyncedStoreRef = useRef("");

  useEffect(() => {
    saveLocalAdminStore(store);
  }, [store]);

  useEffect(() => {
    let cancelled = false;

    async function syncInitialStore() {
      try {
        const remoteStore = await fetchRemoteAdminStore();
        if (cancelled) return;

        if (
          remoteStore.source === "seed" &&
          initialLocalState.source === "local"
        ) {
          const migratedStore = await saveRemoteAdminStore(initialLocalState.store);
          if (cancelled) return;

          lastSyncedStoreRef.current = serializeStore(migratedStore.store);
          setStore(migratedStore.store);
        } else {
          lastSyncedStoreRef.current = serializeStore(remoteStore.store);
          setStore(remoteStore.store);
        }

        setSyncStatus("saved");
        setSyncErrorMessage(null);
      } catch (error) {
        if (cancelled) return;
        setSyncErrorMessage(
          error instanceof Error ? error.message : "Unable to load blog posts.",
        );
        setSyncStatus("error");
      } finally {
        if (!cancelled) {
          setIsRemoteStoreReady(true);
        }
      }
    }

    void syncInitialStore();

    return () => {
      cancelled = true;
    };
  }, [initialLocalState]);

  useEffect(() => {
    if (!isRemoteStoreReady) return;

    const serializedStore = serializeStore(store);
    if (serializedStore === lastSyncedStoreRef.current) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setSyncStatus("saving");

        try {
          const remoteStore = await saveRemoteAdminStore(store);
          if (cancelled) return;

          lastSyncedStoreRef.current = serializeStore(remoteStore.store);
          setStore((current) =>
            serializeStore(current) === serializedStore ? remoteStore.store : current,
          );
          setSyncErrorMessage(null);
          setSyncStatus("saved");
        } catch (error) {
          if (cancelled) return;
          setSyncErrorMessage(
            error instanceof Error ? error.message : "Unable to save blog posts.",
          );
          setSyncStatus("error");
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isRemoteStoreReady, store]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (
        event.key &&
        event.key !== ADMIN_BLOG_STORAGE_KEY &&
        event.key !== LEGACY_ADMIN_BLOG_STORAGE_KEY
      ) {
        return;
      }

      setStore(loadLocalAdminStore().store);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sortedPosts = useMemo(
    () =>
      [...store.posts].sort(
        (firstPost, secondPost) =>
          new Date(secondPost.updatedAt).getTime() -
          new Date(firstPost.updatedAt).getTime(),
      ),
    [store.posts],
  );

  const filteredPosts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return sortedPosts.filter((post) => {
      if (!query) return true;

      return [
        post.title,
        post.category,
        post.slug,
        post.seoTitle,
        post.seoDescription,
        ...post.keywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [deferredSearch, sortedPosts]);

  const activeSelectedId =
    selectedId && store.posts.some((post) => post.id === selectedId)
      ? selectedId
      : store.posts[0]?.id ?? null;

  const selectedPost =
    sortedPosts.find((post) => post.id === activeSelectedId) ?? null;

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set([...DEFAULT_CATEGORIES, ...store.posts.map((post) => post.category)]),
      ),
    [store.posts],
  );

  function replaceSelectedPost(
    updater: (post: ManagedBlogPost) => ManagedBlogPost,
  ) {
    if (!activeSelectedId) return;

    setStore((current) => ({
      ...current,
      posts: current.posts.map((post) =>
        post.id === activeSelectedId ? updater(post) : post,
      ),
    }));
  }

  function updateTitle(value: string) {
    if (!selectedPost) return;

    const currentGeneratedSlug = slugify(selectedPost.title);
    const nextGeneratedSlug = slugify(value) || selectedPost.slug;

    replaceSelectedPost((post) => {
      const nextSlug =
        !post.slug || post.slug === currentGeneratedSlug
          ? nextGeneratedSlug
          : post.slug;

      return {
        ...post,
        title: value,
        slug: nextSlug,
        seoTitle: post.seoTitle === selectedPost.title ? value : post.seoTitle,
        sections: bodyHtmlToSections(post.bodyHtml, nextSlug),
      };
    });
  }

  function updateSimpleField<K extends keyof ManagedBlogPost>(
    key: K,
    value: ManagedBlogPost[K],
  ) {
    replaceSelectedPost((post) => {
      const nextPost = {
        ...post,
        [key]: value,
      };

      if (key === "slug") {
        const nextSlug = slugify(String(value)) || post.slug;
        return {
          ...nextPost,
          slug: nextSlug,
          sections: bodyHtmlToSections(post.bodyHtml, nextSlug),
        };
      }

      return nextPost;
    });
  }

  function updateBodyHtml(value: string) {
    replaceSelectedPost((post) => ({
      ...post,
      bodyHtml: value,
      sections: bodyHtmlToSections(value, post.slug),
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
          id: `${post.slug}-faq-${post.faq.length + 1}-${Date.now()}`,
          question: "New question",
          answer: "Write a direct answer here.",
        },
      ],
    }));
  }

  function removeFaq(faqId: string) {
    replaceSelectedPost((post) => ({
      ...post,
      faq: post.faq.filter((faq) => faq.id !== faqId),
    }));
  }

  function createPost() {
    const newPost = createEmptyManagedPost();

    setStore((current) => ({
      ...current,
      posts: [newPost, ...current.posts],
    }));

    setSearch("");
    startTransition(() => setSelectedId(newPost.id));
  }

  function saveDraft() {
    const today = new Date().toISOString().slice(0, 10);

    replaceSelectedPost((post) => ({
      ...post,
      status: "draft",
      updatedAt: today,
      sections: bodyHtmlToSections(post.bodyHtml, post.slug),
    }));
  }

  function publishPost() {
    const today = new Date().toISOString().slice(0, 10);

    replaceSelectedPost((post) => ({
      ...post,
      status: "published",
      publishedAt: post.publishedAt || today,
      updatedAt: today,
      sections: bodyHtmlToSections(post.bodyHtml, post.slug),
    }));
  }

  function deletePost(postId: string) {
    const post = store.posts.find((item) => item.id === postId);
    if (!post) return;

    if (!window.confirm(`Delete "${post.title}"?`)) {
      return;
    }

    const remainingPosts = store.posts.filter((item) => item.id !== postId);

    setStore((current) => ({
      ...current,
      posts: current.posts.filter((item) => item.id !== postId),
    }));

    if (activeSelectedId === postId) {
      startTransition(() => setSelectedId(remainingPosts[0]?.id ?? null));
    }
  }

  const syncMessage =
    syncStatus === "loading"
      ? "Loading stored posts..."
      : syncStatus === "saving"
        ? "Syncing changes to the live site..."
        : syncStatus === "error"
          ? syncErrorMessage ?? "Sync failed. Refresh and sign in again if needed."
          : "Changes synced to the live site.";

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Blog Manager
          </h1>

          <button
            type="button"
            onClick={createPost}
            className={PRIMARY_BUTTON_CLASS}
          >
            New Post
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[21rem_minmax(0,1fr)] lg:px-8 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className={`flex h-full flex-col overflow-hidden ${PANEL_CLASS}`}>
            <div className="border-b border-gray-200 p-4 sm:p-5">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts"
                  className={`${INPUT_CLASS} bg-gray-50 py-3 pl-10 pr-4`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 sm:px-5">
              <span>All Posts</span>
              <span>{filteredPosts.length}</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isActive={selectedPost?.id === post.id}
                  onSelect={() => setSelectedId(post.id)}
                  onDelete={() => deletePost(post.id)}
                />
              ))}

              {!filteredPosts.length ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                  No posts match your search.
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          {selectedPost ? (
            <div className="space-y-6">
              <div className={`sticky top-20 z-30 p-4 sm:p-5 ${PANEL_CLASS}`}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="truncate text-xl font-semibold text-gray-800 md:text-2xl">
                        {selectedPost.title}
                      </h2>
                      <StatusBadge status={selectedPost.status} />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Last updated {formatDateLabel(selectedPost.updatedAt)}
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm",
                        syncStatus === "error" ? "text-red-600" : "text-gray-500",
                      ].join(" ")}
                    >
                      {syncMessage}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={saveDraft}
                      className={PRIMARY_BUTTON_CLASS}
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={publishPost}
                      className={PRIMARY_BUTTON_CLASS}
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>

              <div className={`space-y-6 p-5 sm:p-6 lg:p-8 ${PANEL_CLASS}`}>
                <div className={`grid gap-6 p-5 lg:p-6 ${SECTION_CLASS}`}>
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="space-y-6">
                      <label className="block space-y-3">
                        <span className={LABEL_CLASS}>Article Title</span>
                        <input
                          value={selectedPost.title}
                          onChange={(event) => updateTitle(event.target.value)}
                          placeholder="Enter article title"
                          className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-2xl font-semibold tracking-tight text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 md:text-3xl"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <label className="block space-y-2">
                          <span className={LABEL_CLASS}>Category</span>
                          <select
                            value={selectedPost.category}
                            onChange={(event) =>
                              updateSimpleField("category", event.target.value)
                            }
                            className={INPUT_CLASS}
                          >
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="space-y-2">
                          <span className={LABEL_CLASS}>Status</span>
                          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
                            {(["draft", "published"] as BlogStatus[]).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updateSimpleField("status", status)}
                                className={[
                                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                                  selectedPost.status === status
                                    ? "bg-emerald-600 text-white"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                                ].join(" ")}
                              >
                                {status === "published" ? "Published" : "Draft"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="block space-y-2">
                          <span className={LABEL_CLASS}>Published Date</span>
                          <input
                            type="date"
                            value={selectedPost.publishedAt}
                            onChange={(event) =>
                              updateSimpleField("publishedAt", event.target.value)
                            }
                            className={INPUT_CLASS}
                          />
                        </label>
                      </div>
                    </div>

                    <div className={`p-5 ${SECTION_CLASS}`}>
                      <p className={LABEL_CLASS}>Post Details</p>
                      <dl className="mt-4 space-y-4 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-gray-500">Status</dt>
                          <dd>
                            <StatusBadge status={selectedPost.status} />
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-gray-500">Category</dt>
                          <dd className="text-right font-medium text-gray-800">
                            {selectedPost.category}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-gray-500">Published</dt>
                          <dd className="text-right font-medium text-gray-800">
                            {formatDateLabel(selectedPost.publishedAt)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-gray-500">Slug</dt>
                          <dd className="max-w-[12rem] truncate text-right font-medium text-gray-800">
                            /blog/{selectedPost.slug}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className={`p-5 sm:p-6 lg:p-6 ${SECTION_CLASS}`}>
                  <div className="mb-5">
                    <p className={LABEL_CLASS}>Body</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-gray-800">
                      Rich text editor
                    </h3>
                  </div>

                  <RichTextEditor
                    key={selectedPost.id}
                    value={selectedPost.bodyHtml}
                    onChange={updateBodyHtml}
                  />
                </div>

                <details className={`group ${SECTION_CLASS}`}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-6 [&::-webkit-details-marker]:hidden">
                    <div>
                      <p className={LABEL_CLASS}>SEO</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-gray-800">
                        Search fields
                      </h3>
                    </div>
                    <ChevronIcon className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>

                  <div className="grid gap-4 border-t border-gray-200 px-5 py-5 sm:px-6 lg:grid-cols-2 lg:px-6">
                    <label className="block space-y-2">
                      <span className={LABEL_CLASS}>Meta Title</span>
                      <input
                        value={selectedPost.seoTitle}
                        onChange={(event) =>
                          updateSimpleField("seoTitle", event.target.value)
                        }
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className={LABEL_CLASS}>Slug</span>
                      <input
                        value={selectedPost.slug}
                        onChange={(event) =>
                          updateSimpleField("slug", slugify(event.target.value))
                        }
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="block space-y-2 lg:col-span-2">
                      <span className={LABEL_CLASS}>Meta Description</span>
                      <textarea
                        value={selectedPost.seoDescription}
                        onChange={(event) =>
                          updateSimpleField("seoDescription", event.target.value)
                        }
                        rows={4}
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="block space-y-2 lg:col-span-2">
                      <span className={LABEL_CLASS}>Keywords</span>
                      <textarea
                        value={listToLines(selectedPost.keywords)}
                        onChange={(event) =>
                          updateSimpleField("keywords", linesToList(event.target.value))
                        }
                        rows={4}
                        placeholder="Add one keyword or phrase per line"
                        className={INPUT_CLASS}
                      />
                    </label>
                  </div>
                </details>

                <div className={`p-5 sm:p-6 lg:p-6 ${SECTION_CLASS}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className={LABEL_CLASS}>FAQs</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-gray-800">
                        Question and answer pairs
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={addFaq}
                      className={SECONDARY_BUTTON_CLASS}
                    >
                      Add FAQ
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {selectedPost.faq.map((faq) => (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                          <div className="grid flex-1 gap-4">
                            <label className="block space-y-2">
                              <span className={LABEL_CLASS}>Question</span>
                              <input
                                value={faq.question}
                                onChange={(event) =>
                                  updateFaq(faq.id, "question", event.target.value)
                                }
                                className={INPUT_CLASS}
                              />
                            </label>

                            <label className="block space-y-2">
                              <span className={LABEL_CLASS}>Answer</span>
                              <textarea
                                value={faq.answer}
                                onChange={(event) =>
                                  updateFaq(faq.id, "answer", event.target.value)
                                }
                                rows={4}
                                className={INPUT_CLASS}
                              />
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFaq(faq.id)}
                            className={DANGER_BUTTON_CLASS}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex min-h-[60vh] items-center justify-center p-8 text-center ${PANEL_CLASS}`}>
              <div className="max-w-md">
                <h2 className="text-2xl font-semibold tracking-tight">
                  No post selected
                </h2>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Create a new post to start writing, or choose an existing post
                  from the sidebar.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
