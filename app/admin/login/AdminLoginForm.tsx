"use client";

import { startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getNextAdminPath(value: string | null) {
  if (!value || !value.startsWith("/admin")) {
    return "/admin";
  }

  return value;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setError(payload?.error ?? "Unable to sign in right now.");
        setPending(false);
        return;
      }

      const nextPath = getNextAdminPath(searchParams.get("next"));

      startTransition(() => {
        router.replace(nextPath);
        router.refresh();
      });
    } catch {
      setError("The login request failed. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <label
          htmlFor="admin-login"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Login ID
        </label>
        <input
          id="admin-login"
          type="text"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          placeholder="Enter your admin login"
          autoComplete="username"
          className="border border-border bg-background px-4 py-4 text-sm"
          disabled={pending}
          required
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="admin-password"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          className="border border-border bg-background px-4 py-4 text-sm"
          disabled={pending}
          required
        />
      </div>

      {error ? (
        <div className="border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center bg-foreground px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
