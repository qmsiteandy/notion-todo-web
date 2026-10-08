import Link from "next/link";
import { AddTask } from "@/components/AddTask";
import { LoadError, PageHeader } from "@/components/LoadError";
import { TaskList, TaskRow } from "@/components/TaskRow";
import { todayInTaipei } from "@/lib/dates";
import { listPlans, listTasks } from "@/lib/store";
import { STATUSES, dayOf } from "@/lib/tasks";
import { TAGS, type Plan, type Task } from "@/lib/types";

type Search = { tag?: string; plan?: string };

function href(current: Search, change: Search) {
  const params = new URLSearchParams();
  const merged = { ...current, ...change };
  if (merged.tag) params.set("tag", merged.tag);
  if (merged.plan) params.set("plan", merged.plan);
  const qs = params.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}

function Chip({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={to} className={`rounded-full px-3 py-1.5 text-[13px] ${active ? "bg-navy text-white" : "border border-line bg-white hover:border-line-2"}`}>
      {children}
    </Link>
  );
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  let tasks: Task[];
  let plans: Plan[];
  try {
    [tasks, plans] = await Promise.all([listTasks(), listPlans()]);
  } catch (error) {
    console.error(error);
    return <main className="p-6 md:p-9"><LoadError /></main>;
  }

  const today = todayInTaipei();
  const titles = new Map(plans.map((p) => [p.id, p.title]));
  const filtered = tasks.filter(
    (t) => (!search.tag || t.tag === search.tag) && (!search.plan || t.planIds.includes(search.plan)),
  );
  const planOptions = plans.filter((p) => tasks.some((t) => t.planIds.includes(p.id) && !t.done));

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 md:px-9 md:py-7">
      <PageHeader eyebrow={`共 ${tasks.filter((t) => !t.done).length} 件未完成`} title="全部任務" />

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-muted">標籤</span>
          <Chip to={href(search, { tag: undefined })} active={!search.tag}>全部</Chip>
          {TAGS.map((tag) => (
            <Chip key={tag} to={href(search, { tag })} active={search.tag === tag}>{tag}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-muted">月計畫</span>
          <Chip to={href(search, { plan: undefined })} active={!search.plan}>全部</Chip>
          {planOptions.map((p) => (
            <Chip key={p.id} to={href(search, { plan: p.id })} active={search.plan === p.id}>{p.title}</Chip>
          ))}
        </div>
      </div>

      <AddTask planId={search.plan} date={null} placeholder="新增任務（未排日期），按 Enter 送出" />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {STATUSES.map((status) => {
          let column = filtered.filter((t) => t.status === status);
          column.sort((a, b) => (dayOf(a.date) ?? "9").localeCompare(dayOf(b.date) ?? "9"));
          if (status === "完成") column = column.reverse().slice(0, 20);
          return (
            <section key={status} className="flex flex-col gap-2.5 rounded-xl bg-ink/[0.035] p-3">
              <h2 className="flex items-center gap-2 px-1 text-sm font-bold">
                <span className={`size-2 rounded-full ${status === "完成" ? "bg-green" : status === "進行中" ? "bg-doing" : "bg-muted"}`} />
                {status}
                <span className="font-mono text-xs font-normal text-muted">{filtered.filter((t) => t.status === status).length}</span>
              </h2>
              {column.length > 0 ? (
                <TaskList>
                  {column.map((t) => (
                    <TaskRow
                      key={`${t.id}-${t.status}`}
                      task={t}
                      planTitle={titles.get(t.planIds[0] ?? "")}
                      overdue={!t.done && (dayOf(t.date) ?? "9") < today}
                    />
                  ))}
                </TaskList>
              ) : (
                <p className="px-1 pb-2 text-[13px] text-muted">沒有任務</p>
              )}
              {status === "完成" && column.length === 20 && <p className="px-1 text-xs text-muted">只顯示最近 20 件</p>}
            </section>
          );
        })}
      </div>
    </main>
  );
}
