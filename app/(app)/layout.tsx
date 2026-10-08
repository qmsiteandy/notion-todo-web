import { logout } from "../login/actions";
import { BottomNav, SideNav } from "@/components/Nav";
import { Logo } from "@/components/icons";
import { todayInTaipei } from "@/lib/dates";
import { isActivePlan } from "@/lib/notion";
import { requireLogin } from "@/lib/session";
import { listPlans, listTasks } from "@/lib/store";
import { planProgress, splitToday } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireLogin();

  let sidebar: React.ReactNode = null;
  let counts: Record<string, number | undefined> = {};
  try {
    const [tasks, plans] = await Promise.all([listTasks(), listPlans()]);
    const { overdue, todays } = splitToday(tasks, todayInTaipei());
    const monthPlans = plans.filter((p) => p.thisMonth && isActivePlan(p));
    counts = {
      "/": overdue.length + todays.filter((t) => !t.done).length,
      "/tasks": tasks.filter((t) => !t.done).length,
      "/plans": monthPlans.length,
    };
    sidebar = (
      <div className="mt-6 flex flex-col gap-1">
        <p className="px-2.5 pb-1 text-[11px] tracking-widest text-side-muted">本月計畫</p>
        {monthPlans.map((plan) => {
          const { done, total, ratio } = planProgress(plan, tasks);
          return (
            <div key={plan.id} className="flex flex-col gap-1.5 px-2.5 py-1.5">
              <div className="flex justify-between gap-2 text-[13px]">
                <span className="truncate">{plan.title}</span>
                <span className="font-mono text-[11px] text-side-muted">
                  {done}/{total}
                </span>
              </div>
              <div className="h-[3px] rounded-full bg-navy-2">
                <div className="h-full rounded-full bg-green-hi" style={{ width: `${Math.round(ratio * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-58 shrink-0 flex-col bg-navy px-3 py-5 text-side md:flex">
        <div className="flex items-center gap-2 px-2 pb-5 text-base font-bold text-white">
          <Logo />
          我的待辦
        </div>
        <SideNav counts={counts} />
        {sidebar}
        <div className="mt-auto flex items-center justify-between border-t border-navy-2 px-2 pt-3 text-xs text-side-muted">
          <span className="flex items-center gap-2">
            <span className="size-[7px] rounded-full bg-green-hi" />與 Notion 同步
          </span>
          <form action={logout}>
            <button className="hover:text-white">登出</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}
