import Link from "next/link";
import { LoadError, PageHeader } from "@/components/LoadError";
import { WeekPlanner } from "@/components/WeekPlanner";
import { todayInTaipei } from "@/lib/dates";
import { listPlans, listTasks } from "@/lib/store";
import { addDays, dayOf, shortDate, weekStart } from "@/lib/tasks";
import type { Plan, Task } from "@/lib/types";

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  let tasks: Task[];
  let plans: Plan[];
  try {
    [tasks, plans] = await Promise.all([listTasks(), listPlans()]);
  } catch (error) {
    console.error(error);
    return <main className="p-6 md:p-9"><LoadError /></main>;
  }

  const today = todayInTaipei();
  const start = weekStart(week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = days[6];
  const visible = tasks.filter((t) => {
    const day = dayOf(t.date);
    return day ? day >= start && day <= end : !t.done;
  });
  const planTitles = Object.fromEntries(plans.map((p) => [p.id, p.title]));
  const nav = "rounded-md border border-line-2 bg-white px-3 py-1.5 text-[13px] hover:border-green hover:text-green";

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-9 md:py-7">
      <PageHeader eyebrow={`${shortDate(start)} – ${shortDate(end)}`} title="規劃">
        <div className="flex items-center gap-2">
          <Link href={`/plan?week=${addDays(start, -7)}`} className={nav}>上一週</Link>
          <Link href="/plan" className={nav}>本週</Link>
          <Link href={`/plan?week=${addDays(start, 7)}`} className={nav}>下一週</Link>
        </div>
      </PageHeader>
      <WeekPlanner key={start} tasks={visible} days={days} today={today} planTitles={planTitles} />
    </main>
  );
}
