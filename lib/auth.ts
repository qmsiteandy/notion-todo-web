import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
const failures = { count: 0, lockedUntil: 0 };

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return safeEqual(actual, expected);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const expires = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expires}.${sign(expires, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): boolean {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  const expected = Buffer.from(sign(expires, secret), "hex");
  const actual = Buffer.from(signature, "hex");
  if (!safeEqual(actual, expected)) return false;
  return Number(expires) > now;
}

// Best-effort brute-force guard. State is per server instance, so on serverless
// hosting it slows guessing down but does not make it impossible.
export function isLocked(now = Date.now()): boolean {
  return failures.lockedUntil > now;
}

export function recordLoginResult(ok: boolean, now = Date.now()): void {
  if (ok) {
    failures.count = 0;
    return;
  }
  failures.count += 1;
  if (failures.count >= MAX_FAILURES) {
    failures.count = 0;
    failures.lockedUntil = now + LOCK_MS;
  }
}
