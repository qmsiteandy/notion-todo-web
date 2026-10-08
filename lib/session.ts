import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireEnv } from "./env.ts";
import { SESSION_COOKIE, verifySessionToken } from "./auth.ts";

export async function isLoggedIn(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, requireEnv("SESSION_SECRET"));
}

export async function requireLogin(): Promise<void> {
  if (!(await isLoggedIn())) redirect("/login");
}
