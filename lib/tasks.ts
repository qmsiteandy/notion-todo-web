import type { Plan, Task, TaskStatus } from "./types.ts";

export const STATUSES: TaskStatus[] = ["未開始", "進行中", "完成"];

export function nextStatus(status: TaskStatus): TaskStatus {
  return STATUSES[(STATUSES.indexOf(status) + 1) % STATUSES.length];
}

export function dayOf(date: string | null): string | null {
  return date ? date.slice(0, 10) : null;
}

export function splitToday(tasks: Task[], today: string) {
  const overdue: Task[] = [];
  const todays: Task[] = [];
  for (const task of tasks) {
    const day = dayOf(task.date);
    if (!day) continue;
    if (day === today) todays.push(task);
    else if (day < today && !task.done) overdue.push(task);
  }
  // Open tasks first, finished ones sink to the bottom of today's list.
  todays.sort((a, b) => Number(a.done) - Number(b.done));
  overdue.sort((a, b) => (dayOf(a.date) ?? "").localeCompare(dayOf(b.date) ?? ""));
  return { overdue, todays };
}

export function planProgress(plan: Plan, tasks: Task[]) {
  const own = tasks.filter((t) => t.planIds.includes(plan.id));
  const done = own.filter((t) => t.done).length;
  return { tasks: own, done, total: own.length, ratio: own.length ? done / own.length : 0 };
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Monday of the week containing `day` (YYYY-MM-DD). */
export function weekStart(day: string): string {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(day, -((weekday + 6) % 7));
}

export function shortDate(day: string | null): string {
  if (!day) return "";
  const [, m, d] = day.slice(0, 10).split("-");
  return `${m}/${d}`;
}

const WEEKDAYS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
export function weekdayName(day: string): string {
  return WEEKDAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
}
