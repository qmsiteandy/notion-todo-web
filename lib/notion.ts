import { Client } from "@notionhq/client";
import { requireEnv } from "./env.ts";

export type Task = {
  id: string;
  name: string;
  date: string | null;
  status: string;
  done: boolean;
  tag: string | null;
  planIds: string[];
};

export type Plan = {
  id: string;
  title: string;
  status: string;
  type: string | null;
  start: string | null;
  end: string | null;
  taskCount: number;
  progress: number | null;
};

type Props = Record<string, any>;

const DONE_STATUS = "完成";

function plainText(items: { plain_text: string }[] | undefined): string {
  return (items ?? []).map((item) => item.plain_text).join("");
}

function rollupNumber(prop: Props | undefined): number | null {
  const rollup = prop?.rollup;
  return rollup?.type === "number" && typeof rollup.number === "number" ? rollup.number : null;
}

export function toTask(page: { id: string; properties: Props }): Task {
  const p = page.properties;
  const rawStatus: string = p["進度狀態"]?.status?.name ?? "未開始";
  // The web app only uses three states; Notion's "Pending..." shows as not started.
  const status = rawStatus === DONE_STATUS || rawStatus === "進行中" ? rawStatus : "未開始";
  return {
    id: page.id,
    name: plainText(p["Name"]?.title) || "（未命名）",
    date: p["Date"]?.date?.start ?? null,
    status,
    done: status === DONE_STATUS,
    tag: p["標籤"]?.select?.name ?? null,
    planIds: (p["🌕 月計畫"]?.relation ?? []).map((r: { id: string }) => r.id),
  };
}

export function toPlan(page: { id: string; properties: Props }): Plan {
  const p = page.properties;
  const progress = rollupNumber(p["完成度"]);
  return {
    id: page.id,
    title: plainText(p["項目"]?.title) || "（未命名）",
    status: p["Status"]?.status?.name ?? "",
    type: p["類型"]?.select?.name ?? null,
    start: p["期間"]?.date?.start ?? null,
    end: p["期間"]?.date?.end ?? null,
    taskCount: rollupNumber(p["任務數"]) ?? 0,
    progress: progress === null ? null : Math.min(1, Math.max(0, progress)),
  };
}

export function isActivePlan(plan: Plan): boolean {
  return !plan.status.startsWith("完成") && !plan.status.startsWith("取消");
}

function client(): Client {
  return new Client({ auth: requireEnv("NOTION_TOKEN") });
}

async function queryAll(dataSourceId: string): Promise<{ id: string; properties: Props }[]> {
  const notion = client();
  const pages: { id: string; properties: Props }[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const result of res.results) {
      if ("properties" in result) pages.push(result as unknown as { id: string; properties: Props });
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return pages;
}

export async function fetchTasks(): Promise<Task[]> {
  return (await queryAll(requireEnv("NOTION_TASKS_DATA_SOURCE_ID"))).map(toTask);
}

export async function fetchPlans(): Promise<Plan[]> {
  return (await queryAll(requireEnv("NOTION_PLANS_DATA_SOURCE_ID"))).map(toPlan).filter(isActivePlan);
}
