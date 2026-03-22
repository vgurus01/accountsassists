import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "../../lib/server/admin-auth";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Accounts Assists protected admin login.",
  alternates: { canonical: "/admin/login" },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = verifyAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background text-foreground admin-grid-bg">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="border border-border bg-background p-8 admin-spotlight md:p-12">
          <div className="inline-flex items-center gap-3 border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <span className="h-2 w-2 bg-foreground" />
            Protected admin
          </div>
          <h1 className="mt-8 max-w-xl text-4xl leading-[1.02] tracking-tight md:text-6xl">
            Sign in to manage the Accounts Assists blog.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-muted md:text-base">
            This workspace is reserved for internal publishing. Use your admin
            login to create posts, improve SEO fields, track updates, and keep
            the article library organised.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="border border-border bg-background p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Security
              </div>
              <div className="mt-3 text-sm leading-7 text-muted">
                Successful sign-in issues a secure HTTP-only session cookie for
                this browser.
              </div>
            </div>
            <div className="border border-border bg-surface p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Workflow
              </div>
              <div className="mt-3 text-sm leading-7 text-muted">
                Draft, publish, duplicate, export, and review article readiness
                from one dashboard.
              </div>
            </div>
          </div>
        </section>

        <section className="border border-border bg-background p-8 md:p-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Admin login
          </div>
          <h2 className="mt-4 text-3xl leading-tight md:text-4xl">
            Enter your credentials.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted md:text-base">
            The login details are stored in the local environment configuration
            for this site, not in the public UI.
          </p>

          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
