import { AddTask } from "@/components/AddTask";
import { LoadError, PageHeader } from "@/components/LoadError";
import { MoveAllToToday } from "@/components/MoveAll";
import { ProgressBar } from "@/components/Progress";
import { TaskList, TaskRow } from "@/components/TaskRow";
import { todayInTaipei } from "@/lib/dates";
import { listPlans, listTasks } from "@/lib/store";
import { splitToday, weekdayName } from "@/lib/tasks";
import type { Plan, Task } from "@/lib/types";

export default async function TodayPage() {
  let tasks: Task[];
  let plans: Plan[];
  try {
    [tasks, plans] = await Promise.all([listTasks(), listPlans()]);
  } catch (error) {
    console.error(error);
    return <main className="p-6 md:p-9"><LoadError /></main>;
  }

  const today = todayInTaipei();
  const { overdue, todays } = splitToday(tasks, today);
  const titles = new Map(plans.map((p) => [p.id, p.title]));
  const planOf = (t: Task) => titles.get(t.planIds[0] ?? "");
  const doneCount = todays.filter((t) => t.done).length;
  const total = todays.length + overdue.length;
  const [, m, d] = today.split("-");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:px-9 md:py-7">
      <PageHeader eyebrow={`${Number(m)} 月 ${Number(d)} 日 ${weekdayName(today)}`} title="今天">
        <div className="w-full sm:w-52">
          <div className="flex justify-between text-[13px] text-muted">
            <span>已完成</span>
            <span className="font-mono text-ink">
              {doneCount} / {total}
            </span>
          </div>
          <ProgressBar ratio={total ? doneCount / total : 0} className="mt-1.5" />
        </div>
      </PageHeader>

      {overdue.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-bold">
              逾期 <span className="rounded-full bg-warn-soft px-2 font-mono text-xs font-normal text-warn">{overdue.length}</span>
            </h2>
            <MoveAllToToday ids={overdue.map((t) => t.id)} />
          </div>
          <TaskList>
            {overdue.map((t) => (
              <TaskRow key={`${t.id}-${t.status}`} task={t} planTitle={planOf(t)} overdue />
            ))}
          </TaskList>
        </section>
      )}

      <section className="flex flex-col gap-2.5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          今天 <span className="rounded-full bg-line px-2 font-mono text-xs font-normal text-muted">{todays.length}</span>
        </h2>
        <AddTask date={today} placeholder="新增今天的任務，按 Enter 送出" />
        {todays.length > 0 ? (
          <TaskList>
            {todays.map((t) => (
              <TaskRow key={`${t.id}-${t.status}`} task={t} planTitle={planOf(t)} showDate={false} />
            ))}
          </TaskList>
        ) : (
          <p className="rounded-lg border border-dashed border-line-2 p-6 text-center text-muted">今天還沒有任務。到「規劃」把任務排到今天，或直接在上面新增。</p>
        )}
      </section>
    </main>
  );
}
