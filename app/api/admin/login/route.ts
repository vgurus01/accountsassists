import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminSessionCookieOptions,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from "../../../lib/server/admin-auth";

type LoginPayload = {
  login?: string;
  password?: string;
};

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        error: "Admin login is not configured on this deployment.",
      },
      { status: 500 },
    );
  }

  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid login request.",
      },
      { status: 400 },
    );
  }

  const login = payload.login?.trim() ?? "";
  const password = payload.password ?? "";

  if (!validateAdminCredentials(login, password)) {
    return NextResponse.json(
      {
        error: "Incorrect login or password.",
      },
      { status: 401 },
    );
  }

  const session = createAdminSession(login);
  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    session.value,
    getAdminSessionCookieOptions(session.expiresAt),
  );

  return response;
}
