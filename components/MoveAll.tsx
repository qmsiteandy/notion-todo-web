"use client";

import { useTransition } from "react";
import { moveToToday } from "@/app/actions";

export function MoveAllToToday({ ids }: { ids: string[] }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => moveToToday(ids))}
      className="text-[13px] font-bold text-green hover:underline disabled:opacity-50"
    >
      {pending ? "移動中…" : "全部移到今天"}
    </button>
  );
}
