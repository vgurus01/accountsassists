import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hydrateAdminStore } from "../../../lib/admin-blog";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "../../../lib/server/admin-auth";
import {
  getAdminBlogStore,
  saveAdminBlogStore,
} from "../../../lib/server/blog-store";

export const runtime = "nodejs";

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function hasAdminSession() {
  const cookieStore = await cookies();
  return Boolean(
    verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value),
  );
}

export async function GET() {
  if (!(await hasAdminSession())) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  return jsonResponse(await getAdminBlogStore());
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  const store = hydrateAdminStore(payload);

  if (!store) {
    return jsonResponse({ error: "Invalid blog store payload." }, 400);
  }

  await saveAdminBlogStore(store);

  return jsonResponse({
    store,
    source: "file",
  });
}
