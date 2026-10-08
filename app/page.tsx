import { logout } from "./login/actions";
import { todayInTaipei } from "@/lib/dates";
import { fetchPlans, fetchTasks, type Plan, type Task } from "@/lib/notion";
import { requireLogin } from "@/lib/session";

export const dynamic = "force-dynamic";

function TaskRow({ task, planTitle }: { task: Task; planTitle?: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
      <div className="min-w-0">
        <p className={`truncate ${task.done ? "text-neutral-400 line-through" : ""}`}>{task.name}</p>
        <p className="truncate text-xs text-neutral-500">
          {[task.tag, planTitle, task.date].filter(Boolean).join(" · ")}
        </p>
      </div>
      <span className="shrink-0 text-xs text-neutral-500">{task.status}</span>
    </li>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const percent = Math.round((plan.progress ?? 0) * 100);
  return (
    <li className="rounded-lg bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-medium">{plan.title}</p>
        <span className="shrink-0 text-xs text-neutral-500">{plan.status}</span>
      </div>
      <p className="text-xs text-neutral-500">
        {[plan.type, plan.start && `${plan.start}${plan.end ? ` → ${plan.end}` : ""}`, `${plan.taskCount} 個任務`]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-neutral-600">
        {title} <span className="font-normal">({count})</span>
      </h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </section>
  );
}

export default async function Home() {
  await requireLogin();

  let tasks: Task[];
  let plans: Plan[];
  try {
    [tasks, plans] = await Promise.all([fetchTasks(), fetchPlans()]);
  } catch (error) {
    console.error(error);
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
        <p className="rounded-lg bg-red-50 p-4 text-red-700">
          無法從 Notion 讀取資料，請確認 token 與資料庫的分享設定。
        </p>
        <form action={logout}>
          <button className="text-sm text-neutral-500 underline">登出</button>
        </form>
      </main>
    );
  }

  const today = todayInTaipei();
  const open = tasks.filter((t) => !t.done);
  const overdue = open.filter((t) => t.date && t.date.slice(0, 10) < today);
  const todays = open.filter((t) => t.date?.slice(0, 10) === today);
  const later = open.filter((t) => !t.date || t.date.slice(0, 10) > today);
  const planTitles = new Map(plans.map((p) => [p.id, p.title]));
  const titleOf = (t: Task) => planTitles.get(t.planIds[0] ?? "");

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">今天 {today}</h1>
        <form action={logout}>
          <button className="text-sm text-neutral-500 underline">登出</button>
        </form>
      </header>
      <Section title="今天" count={todays.length}>
        {todays.map((t) => <TaskRow key={t.id} task={t} planTitle={titleOf(t)} />)}
      </Section>
      <Section title="逾期" count={overdue.length}>
        {overdue.map((t) => <TaskRow key={t.id} task={t} planTitle={titleOf(t)} />)}
      </Section>
      <Section title="月計畫（未完成）" count={plans.length}>
        {plans.map((p) => <PlanCard key={p.id} plan={p} />)}
      </Section>
      <Section title="之後或未排日期" count={later.length}>
        {later.map((t) => <TaskRow key={t.id} task={t} planTitle={titleOf(t)} />)}
      </Section>
    </main>
  );
}
