"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">我的待辦</h1>
      <form action={action} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
          placeholder="密碼"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2"
        />
        <button
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
        >
          登入
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
