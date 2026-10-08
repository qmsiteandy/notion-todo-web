"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setDate } from "@/app/actions";
import { dayOf, shortDate, weekdayName } from "@/lib/tasks";
import type { Task } from "@/lib/types";

type Props = {
  tasks: Task[];
  days: string[];
  today: string;
  planTitles: Record<string, string>;
};

const UNSCHEDULED = "unscheduled";

export function WeekPlanner({ tasks, days, today, planTitles }: Props) {
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [optimistic, move] = useOptimistic(tasks, (state, change: { id: string; date: string | null }) =>
    state.map((t) => (t.id === change.id ? { ...t, date: change.date } : t)),
  );

  function schedule(id: string, date: string | null) {
    const task = optimistic.find((t) => t.id === id);
    if (!task || dayOf(task.date) === date) return;
    setError(null);
    startTransition(async () => {
      move({ id, date });
      try {
        await setDate(id, date);
      } catch {
        setError("沒有存到 Notion，請再試一次。");
      }
    });
  }

  function dropZone(key: string, date: string | null) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        setOver(key);
      },
      onDragLeave: () => setOver((o) => (o === key ? null : o)),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        setOver(null);
        const id = e.dataTransfer.getData("text/plain");
        if (id) schedule(id, date);
      },
    };
  }

  const unscheduled = optimistic.filter((t) => !t.date && !t.done);
  const byDay = (day: string) => optimistic.filter((t) => dayOf(t.date) === day);

  const card = (t: Task) => (
    <div
      key={t.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", t.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`flex cursor-grab flex-col gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-[13px] shadow-[0_1px_0_rgba(0,30,43,0.04)] active:cursor-grabbing ${t.done ? "text-muted" : ""}`}
    >
      <span className={`font-medium leading-snug ${t.done ? "line-through" : ""}`}>{t.name}</span>
      {t.planIds[0] && planTitles[t.planIds[0]] && (
        <span className="self-start rounded bg-green-soft px-1.5 py-0.5 text-[11px] text-green">
          {planTitles[t.planIds[0]]}
        </span>
      )}
      {/* Phones can't drag: pick the date instead. */}
      <label className="flex items-center gap-2 text-[12px] text-muted md:hidden">
        日期
        <input
          type="date"
          value={dayOf(t.date) ?? ""}
          onChange={(e) => schedule(t.id, e.target.value || null)}
          className="rounded border border-line px-1.5 py-1 font-mono text-ink"
        />
      </label>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{error}</p>}
      <div className="grid items-start gap-4 md:grid-cols-[240px_1fr]">
        <section
          {...dropZone(UNSCHEDULED, null)}
          className={`flex flex-col gap-2 rounded-lg border bg-white p-3 md:sticky md:top-4 ${over === UNSCHEDULED ? "border-green bg-green-soft" : "border-line"}`}
        >
          <h2 className="flex items-center justify-between text-sm font-bold">
            還沒排日期
            <span className="font-mono text-xs font-normal text-muted">{unscheduled.length}</span>
          </h2>
          <p className="text-[12px] text-muted">
            <span className="hidden md:inline">拖到右邊的日期上排程，拖回來取消日期。</span>
            <span className="md:hidden">在卡片上選日期。</span>
          </p>
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
            {unscheduled.length ? unscheduled.map(card) : <p className="py-4 text-center text-[13px] text-muted">全部都排好了</p>}
          </div>
        </section>

        <div className="grid gap-2 md:grid-cols-7">
          {days.map((day) => {
            const items = byDay(day);
            const isToday = day === today;
            return (
              <section
                key={day}
                {...dropZone(day, day)}
                className={`flex min-h-24 flex-col gap-2 rounded-lg border p-2 md:min-h-[420px] ${
                  over === day ? "border-green bg-green-soft" : isToday ? "border-green bg-white" : "border-line bg-white/60"
                }`}
              >
                <h3 className={`flex items-baseline justify-between px-1 text-[13px] ${isToday ? "font-bold text-green" : "text-muted"}`}>
                  <span>{weekdayName(day)}{isToday && " · 今天"}</span>
                  <span className="font-mono text-xs">{shortDate(day)}</span>
                </h3>
                {items.map(card)}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
