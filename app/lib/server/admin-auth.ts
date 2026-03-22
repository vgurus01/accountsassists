import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "accountsassists_admin_session";

type AdminSession = {
  login: string;
  expiresAt: number;
};

function getEnvValue(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getSessionTtlDays() {
  const raw = Number(process.env.ADMIN_SESSION_DAYS ?? "30");
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeSession(session: AdminSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string) {
  return JSON.parse(
    Buffer.from(value, "base64url").toString("utf8"),
  ) as AdminSession;
}

function signSessionPayload(payload: string) {
  const secret = getEnvValue("ADMIN_SESSION_SECRET");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isAdminAuthConfigured() {
  return Boolean(
    getEnvValue("ADMIN_LOGIN") &&
      getEnvValue("ADMIN_PASSWORD") &&
      getEnvValue("ADMIN_SESSION_SECRET"),
  );
}

export function getAdminLogin() {
  return getEnvValue("ADMIN_LOGIN");
}

function getAdminPassword() {
  return getEnvValue("ADMIN_PASSWORD");
}

export function validateAdminCredentials(login: string, password: string) {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  return (
    safeEqual(login, getAdminLogin()) && safeEqual(password, getAdminPassword())
  );
}

export function createAdminSession(login = getAdminLogin()) {
  const expiresAt = Date.now() + getSessionTtlDays() * 24 * 60 * 60 * 1000;
  const payload = encodeSession({
    login,
    expiresAt,
  });
  const signature = signSessionPayload(payload);

  return {
    value: `${payload}.${signature}`,
    expiresAt,
  };
}

export function verifyAdminSession(value?: string | null) {
  if (!value || !isAdminAuthConfigured()) {
    return null;
  }

  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) {
    return null;
  }

  const expectedSignature = signSessionPayload(payload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = decodeSession(payload);

    if (
      session.login !== getAdminLogin() ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getAdminSessionCookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
    maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  };
}

export function getClearedAdminSessionCookieOptions() {
  return {
    ...getAdminSessionCookieOptions(0),
    expires: new Date(0),
    maxAge: 0,
  };
}
