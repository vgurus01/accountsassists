import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardShell from "./AdminDashboardShell";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "../lib/server/admin-auth";

export const metadata: Metadata = {
  title: "Blog Manager",
  description: "Accounts Assists internal blog management workspace.",
  alternates: { canonical: "/admin" },
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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = verifyAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboardShell />;
}
