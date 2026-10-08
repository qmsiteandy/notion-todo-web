"use client";

import { useRef, useState, useTransition } from "react";
import { moveToToday, removeTask, setStatus } from "@/app/actions";
import { nextStatus, shortDate } from "@/lib/tasks";
import type { Task, TaskStatus } from "@/lib/types";
import { CheckIcon, TrashIcon } from "./icons";

const PILL: Record<TaskStatus, string> = {
  未開始: "bg-line text-muted",
  進行中: "bg-doing-soft text-doing",
  完成: "bg-green-soft text-green",
};

type Props = {
  task: Task;
  planTitle?: string;
  overdue?: boolean;
  showDate?: boolean;
};

export function TaskRow({ task, planTitle, overdue = false, showDate = true }: Props) {
  const [status, setLocalStatus] = useState(task.status);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const done = status === "完成";

  function changeStatus(next: TaskStatus) {
    const previous = status;
    setLocalStatus(next);
    setError(null);
    startTransition(async () => {
      try {
        await setStatus(task.id, next);
      } catch {
        setLocalStatus(previous);
        setError("沒有存到 Notion，請再試一次。");
      }
    });
  }

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError("沒有存到 Notion，請再試一次。");
      }
    });
  }

  // Swipe right on touch screens to complete.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") startX.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current !== null) setDx(Math.max(0, Math.min(120, e.clientX - startX.current)));
  };
  const onPointerEnd = () => {
    if (startX.current !== null && dx > 80 && !done) changeStatus("完成");
    startX.current = null;
    setDx(0);
  };

  return (
    <li className="relative list-none overflow-hidden border-t border-line first:border-t-0">
      <div className="absolute inset-0 flex items-center bg-green pl-5 text-sm font-bold text-white" aria-hidden="true">
        完成
      </div>
      <div
        className={`relative flex items-center gap-3 bg-white px-4 py-3 transition-[opacity,transform] md:gap-3.5 ${pending ? "opacity-60" : ""}`}
        style={{ transform: `translateX(${dx}px)`, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <button
          type="button"
          onClick={() => changeStatus(done ? "未開始" : "完成")}
          aria-label={done ? `把「${task.name}」改回未完成` : `完成「${task.name}」`}
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-2 focus-visible:ring-green ${
            done ? "border-green bg-green text-white" : "border-line-2 hover:border-green"
          }`}
        >
          {done && <CheckIcon />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`truncate font-medium ${done ? "text-muted line-through" : ""}`}>{task.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted md:hidden">
            {planTitle && <span className="text-green">{planTitle}</span>}
            {showDate && task.date && <span className={`font-mono ${overdue ? "text-warn" : ""}`}>{shortDate(task.date)}</span>}
          </div>
          {error && <p className="mt-1 text-xs text-warn">{error}</p>}
        </div>

        {planTitle && (
          <span className="hidden max-w-40 truncate rounded bg-green-soft px-2 py-0.5 text-xs text-green md:inline">{planTitle}</span>
        )}
        {task.tag && <span className="hidden w-20 truncate text-xs text-muted lg:inline">{task.tag}</span>}
        {showDate && (
          <span className={`hidden w-12 text-right font-mono text-xs md:inline ${overdue ? "text-warn" : "text-muted"}`}>
            {shortDate(task.date)}
          </span>
        )}

        <button
          type="button"
          onClick={() => changeStatus(nextStatus(status))}
          title="點一下切換狀態"
          className={`w-16 shrink-0 rounded-full py-1 text-center text-xs outline-none focus-visible:ring-2 focus-visible:ring-green ${PILL[status]}`}
        >
          {status}
        </button>

        {overdue && (
          <button
            type="button"
            onClick={() => run(() => moveToToday([task.id]))}
            className="hidden shrink-0 rounded-md border border-line-2 px-2.5 py-1 text-xs text-muted hover:border-green hover:text-green sm:inline"
          >
            移到今天
          </button>
        )}

        {confirmDelete ? (
          <span className="flex shrink-0 gap-1">
            <button type="button" onClick={() => run(() => removeTask(task.id))} className="rounded-md bg-warn px-2 py-1 text-xs text-white">
              刪除
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-md border border-line-2 px-2 py-1 text-xs">
              取消
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`刪除「${task.name}」`}
            className="shrink-0 rounded p-1 text-line-2 hover:text-warn focus-visible:text-warn"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </li>
  );
}

export function TaskList({ children }: { children: React.ReactNode }) {
  return <ul className="overflow-hidden rounded-lg border border-line bg-white">{children}</ul>;
}
