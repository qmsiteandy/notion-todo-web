"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireEnv } from "@/lib/env";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isLocked,
  recordLoginResult,
  verifyPassword,
} from "@/lib/auth";

export async function login(_: string | null, formData: FormData): Promise<string | null> {
  if (isLocked()) return "輸錯太多次，請稍後再試。";
  const password = String(formData.get("password") ?? "");
  const ok = verifyPassword(password, requireEnv("APP_PASSWORD_HASH"));
  recordLoginResult(ok);
  if (!ok) return "密碼不正確。";
  (await cookies()).set(SESSION_COOKIE, createSessionToken(requireEnv("SESSION_SECRET")), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect("/");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
