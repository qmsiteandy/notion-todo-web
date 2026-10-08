import Link from "next/link";
import { addPlan } from "@/app/actions";
import { AddTask } from "@/components/AddTask";
import { ChevronIcon, PlusIcon } from "@/components/icons";
import { LoadError, PageHeader } from "@/components/LoadError";
import { ProgressBar } from "@/components/Progress";
import { TaskList, TaskRow } from "@/components/TaskRow";
import { todayInTaipei } from "@/lib/dates";
import { isActivePlan } from "@/lib/notion";
import { listPlans, listTasks } from "@/lib/store";
import { dayOf, planProgress, shortDate } from "@/lib/tasks";
import { PLAN_TYPES, type Plan, type Task } from "@/lib/types";

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const next = (await searchParams).view === "next";
  let tasks: Task[];
  let plans: Plan[];
  try {
    [tasks, plans] = await Promise.all([listTasks(), listPlans()]);
  } catch (error) {
    console.error(error);
    return <main className="p-6 md:p-9"><LoadError /></main>;
  }

  const today = todayInTaipei();
  // Same rules as the Notion views: this month = active and (started or ThisMonth); next month = NextMonth.
  const shown = next
    ? plans.filter((p) => p.nextMonth)
    : plans.filter((p) => isActivePlan(p) && (p.thisMonth || (p.start !== null && p.start <= today)));
  const [y, m] = today.split("-");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 md:px-9 md:py-7">
      <PageHeader eyebrow={`${y} 年 ${Number(m)} 月`} title="月計畫">
        <div className="flex overflow-hidden rounded-md border border-line-2 text-[13px]">
          <Link href="/plans" className={`px-4 py-2 ${next ? "bg-white text-muted" : "bg-navy font-bold text-white"}`}>本月</Link>
          <Link href="/plans?view=next" className={`px-4 py-2 ${next ? "bg-navy font-bold text-white" : "bg-white text-muted"}`}>次月</Link>
        </div>
      </PageHeader>

      {shown.length === 0 && (
        <p className="rounded-lg border border-dashed border-line-2 p-6 text-center text-muted">{next ? "次月還沒有計畫。" : "本月還沒有進行中的計畫。"}</p>
      )}

      {shown.map((plan, i) => {
        const { tasks: own, done, total, ratio } = planProgress(plan, tasks);
        const open = own.filter((t) => !t.done).sort((a, b) => (dayOf(a.date) ?? "9").localeCompare(dayOf(b.date) ?? "9"));
        const finished = own.filter((t) => t.done);
        const late = open.filter((t) => (dayOf(t.date) ?? "9") < today).length;
        return (
          <details key={plan.id} open={i === 0} className="group overflow-hidden rounded-lg border border-line bg-white open:border-green">
            <summary className="flex cursor-pointer list-none items-center gap-3.5 px-4 py-4 md:px-5 [&::-webkit-details-marker]:hidden">
              <ChevronIcon className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90 group-open:text-green" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold">{plan.title}</span>
                  {late > 0 && <span className="rounded-full bg-warn-soft px-2 text-xs text-warn">{late} 件逾期</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {[plan.type, plan.start && `${shortDate(plan.start)}${plan.end ? ` – ${shortDate(plan.end)}` : ""}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="hidden w-56 sm:block">
                <div className="flex justify-between text-xs text-muted">
                  <span>{done} / {total} 完成</span>
                  <span className={`font-mono font-medium ${late ? "text-warn" : "text-green"}`}>{Math.round(ratio * 100)}%</span>
                </div>
                <ProgressBar ratio={ratio} tone={late ? "warn" : "green"} className="mt-1.5" />
              </div>
              <span className={`font-mono text-xs sm:hidden ${late ? "text-warn" : "text-green"}`}>{done}/{total}</span>
            </summary>
            <div className="flex flex-col gap-2 border-t border-line bg-bg px-3 py-3 md:pl-12 md:pr-5">
              {open.length > 0 && (
                <TaskList>
                  {open.map((t) => (
                    <TaskRow key={`${t.id}-${t.status}`} task={t} overdue={(dayOf(t.date) ?? "9") < today} />
                  ))}
                </TaskList>
              )}
              {finished.length > 0 && (
                <details className="rounded-lg border border-line bg-white">
                  <summary className="cursor-pointer px-4 py-2.5 text-[13px] text-muted">已完成 {finished.length} 件</summary>
                  <TaskList>
                    {finished.map((t) => (
                      <TaskRow key={`${t.id}-${t.status}`} task={t} />
                    ))}
                  </TaskList>
                </details>
              )}
              <AddTask planId={plan.id} date={null} placeholder="新增小任務，日期之後再到「規劃」排" dashed />
            </div>
          </details>
        );
      })}

      <details className="rounded-lg border border-dashed border-line-2 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-bold text-green [&::-webkit-details-marker]:hidden">
          <PlusIcon className="size-4" />新增月計畫
        </summary>
        <form action={addPlan} className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-muted">名稱</span>
            <input name="title" required className="rounded-md border border-line-2 px-3 py-2 outline-none focus:border-green" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">開始</span>
            <input type="date" name="start" defaultValue={`${y}-${m}-01`} className="rounded-md border border-line-2 px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">結束</span>
            <input type="date" name="end" className="rounded-md border border-line-2 px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">類型</span>
            <select name="type" className="rounded-md border border-line-2 px-3 py-2">
              <option value="">不指定</option>
              {PLAN_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div className="flex items-end justify-end">
            <button className="rounded-md bg-green px-4 py-2 font-bold text-white">建立月計畫</button>
          </div>
        </form>
      </details>
    </main>
  );
}
