"use client";

import { useRef, useTransition } from "react";
import { addTask } from "@/app/actions";
import { PlusIcon } from "./icons";

type Props = { date?: string | null; planId?: string; placeholder?: string; dashed?: boolean };

export function AddTask({ date, planId, placeholder = "新增任務，按 Enter 送出", dashed = false }: Props) {
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form
      ref={form}
      action={(fd) =>
        startTransition(async () => {
          await addTask(fd);
          form.current?.reset();
        })
      }
      className={`flex items-center gap-2 rounded-lg bg-white px-3 ${dashed ? "border border-dashed border-line-2" : "border border-line"}`}
    >
      <PlusIcon className="size-4 shrink-0 text-green" />
      <input
        name="name"
        required
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2.5 outline-none placeholder:text-muted"
      />
      {date !== undefined && <input type="hidden" name="date" value={date ?? ""} />}
      {planId && <input type="hidden" name="planId" value={planId} />}
      <button disabled={pending} className="rounded-md bg-green px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
        {pending ? "新增中" : "新增"}
      </button>
    </form>
  );
}
