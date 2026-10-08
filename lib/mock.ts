import { randomUUID } from "node:crypto";
import { todayInTaipei } from "./dates.ts";
import { addDays } from "./tasks.ts";
import type { NewPlan, NewTask, Plan, Task, TaskPatch } from "./types.ts";

// Example data for local development (NOTION_MOCK=1). Lives in memory only.
function seed() {
  const today = todayInTaipei();
  const month = today.slice(0, 7);
  const plan = (id: string, title: string, type: string, status = "進行中..."): Plan => ({
    id, title, type, status, start: `${month}-01`, end: `${month}-28`, thisMonth: true, nextMonth: false,
  });
  const plans: Plan[] = [
    plan("p-web", "做出 Notion 待辦網頁", "日常 Side🧑‍💻"),
    plan("p-report", "完成 Q3 報告", "職涯 side 📚"),
    plan("p-run", "跑完一場 10K", "生活興趣"),
    plan("p-read", "每週讀一章設計書", "月重點"),
    { ...plan("p-next", "準備年底旅行", "生活興趣", "未開始"), thisMonth: false, nextMonth: true },
  ];
  const task = (name: string, date: string | null, status: Task["status"], planId: string | null, tag: string | null = null): Task => ({
    id: randomUUID(), name, date, status, done: status === "完成", tag, planIds: planId ? [planId] : [],
  });
  const tasks: Task[] = [
    task("整理 Q3 報告初稿", addDays(today, -2), "進行中", "p-report", "重要！！"),
    task("預約牙醫", addDays(today, -1), "未開始", null),
    task("Next.js 專案第二階段", today, "進行中", "p-web", "SideProject"),
    task("跑步 5 公里", today, "未開始", "p-run", "挑戰⭐"),
    task("讀《設計心理學》第 3 章", today, "未開始", "p-read", "月計畫"),
    task("寫週報", today, "完成", null),
    task("部署到 Vercel", null, "未開始", "p-web", "SideProject"),
    task("手機版面調整", null, "未開始", "p-web", "SideProject"),
    task("密碼登入", addDays(today, -1), "完成", "p-web", "SideProject"),
    task("整理資料庫欄位", addDays(today, -3), "完成", "p-web", "SideProject"),
    task("校對報告數字", null, "未開始", "p-report", "重要！！"),
    task("長跑 8 公里", addDays(today, 2), "未開始", "p-run", "挑戰⭐"),
    task("間歇跑", addDays(today, -4), "完成", "p-run", null),
  ];
  return { plans, tasks };
}

const g = globalThis as typeof globalThis & { __mockData?: ReturnType<typeof seed> };
function data() {
  g.__mockData ??= seed();
  return g.__mockData;
}

export const mockStore = {
  async listTasks(): Promise<Task[]> {
    return data().tasks.map((t) => ({ ...t }));
  },
  async listPlans(): Promise<Plan[]> {
    return data().plans.map((p) => ({ ...p }));
  },
  async updateTask(id: string, patch: TaskPatch): Promise<void> {
    const t = data().tasks.find((x) => x.id === id);
    if (!t) throw new Error("找不到這個任務");
    Object.assign(t, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)));
    t.done = t.status === "完成";
  },
  async createTask(input: NewTask): Promise<void> {
    data().tasks.push({
      id: randomUUID(), name: input.name, date: input.date ?? null, status: "未開始", done: false,
      tag: input.tag ?? null, planIds: input.planId ? [input.planId] : [],
    });
  },
  async deleteTask(id: string): Promise<void> {
    const d = data();
    d.tasks = d.tasks.filter((t) => t.id !== id);
  },
  async createPlan(input: NewPlan): Promise<void> {
    data().plans.push({
      id: randomUUID(), title: input.title, status: "未開始", type: input.type ?? null,
      start: input.start ?? null, end: input.end ?? null, thisMonth: true, nextMonth: false,
    });
  },
};
