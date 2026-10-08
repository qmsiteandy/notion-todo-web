import { Client } from "@notionhq/client";
import { requireEnv } from "./env.ts";
import type { NewPlan, NewTask, Plan, Task, TaskPatch, TaskStatus } from "./types.ts";

type Props = Record<string, any>;
type RawPage = { id: string; properties: Props };

function plainText(items: { plain_text: string }[] | undefined): string {
  return (items ?? []).map((item) => item.plain_text).join("");
}

function formulaBool(prop: Props | undefined): boolean {
  return prop?.formula?.type === "boolean" && prop.formula.boolean === true;
}

export function toTask(page: RawPage): Task {
  const p = page.properties;
  const raw: string = p["進度狀態"]?.status?.name ?? "未開始";
  // The web app only uses three states; Notion's "Pending..." shows as not started.
  const status: TaskStatus = raw === "完成" || raw === "進行中" ? raw : "未開始";
  return {
    id: page.id,
    name: plainText(p["Name"]?.title) || "（未命名）",
    date: p["Date"]?.date?.start ?? null,
    status,
    done: status === "完成",
    tag: p["標籤"]?.select?.name ?? null,
    planIds: (p["🌕 月計畫"]?.relation ?? []).map((r: { id: string }) => r.id),
  };
}

export function toPlan(page: RawPage): Plan {
  const p = page.properties;
  return {
    id: page.id,
    title: plainText(p["項目"]?.title) || "（未命名）",
    status: p["Status"]?.status?.name ?? "",
    type: p["類型"]?.select?.name ?? null,
    start: p["期間"]?.date?.start ?? null,
    end: p["期間"]?.date?.end ?? null,
    thisMonth: formulaBool(p["ThisMonth"]),
    nextMonth: formulaBool(p["NextMonth"]),
  };
}

export function isActivePlan(plan: Plan): boolean {
  return !plan.status.startsWith("完成") && !plan.status.startsWith("取消");
}

export function taskProperties(patch: TaskPatch & { planId?: string | null }): Props {
  const props: Props = {};
  if (patch.name !== undefined) props["Name"] = { title: [{ text: { content: patch.name } }] };
  if (patch.date !== undefined) props["Date"] = { date: patch.date ? { start: patch.date } : null };
  if (patch.status !== undefined) props["進度狀態"] = { status: { name: patch.status } };
  if (patch.tag !== undefined) props["標籤"] = { select: patch.tag ? { name: patch.tag } : null };
  if (patch.planId) props["🌕 月計畫"] = { relation: [{ id: patch.planId }] };
  return props;
}

function client(): Client {
  return new Client({ auth: requireEnv("NOTION_TOKEN") });
}

async function queryAll(dataSourceId: string): Promise<RawPage[]> {
  const notion = client();
  const pages: RawPage[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({ data_source_id: dataSourceId, page_size: 100, start_cursor: cursor });
    for (const result of res.results) {
      if ("properties" in result) pages.push(result as unknown as RawPage);
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return pages;
}

export const notionStore = {
  async listTasks(): Promise<Task[]> {
    return (await queryAll(requireEnv("NOTION_TASKS_DATA_SOURCE_ID"))).map(toTask);
  },
  async listPlans(): Promise<Plan[]> {
    return (await queryAll(requireEnv("NOTION_PLANS_DATA_SOURCE_ID"))).map(toPlan);
  },
  async updateTask(id: string, patch: TaskPatch): Promise<void> {
    await client().pages.update({ page_id: id, properties: taskProperties(patch) });
  },
  async createTask(input: NewTask): Promise<void> {
    await client().pages.create({
      parent: { data_source_id: requireEnv("NOTION_TASKS_DATA_SOURCE_ID") },
      properties: taskProperties({ ...input, status: "未開始" }),
    });
  },
  async deleteTask(id: string): Promise<void> {
    // Moves the page to Notion's trash, where it can still be restored.
    await client().pages.update({ page_id: id, in_trash: true });
  },
  async createPlan(input: NewPlan): Promise<void> {
    const props: Props = { "項目": { title: [{ text: { content: input.title } }] } };
    if (input.start) props["期間"] = { date: { start: input.start, end: input.end || null } };
    if (input.type) props["類型"] = { select: { name: input.type } };
    await client().pages.create({
      parent: { data_source_id: requireEnv("NOTION_PLANS_DATA_SOURCE_ID") },
      properties: props,
    });
  },
};
