import assert from "node:assert/strict";
import { test } from "node:test";
import { toPlan, toTask, taskProperties } from "./notion.ts";
import { nextStatus, planProgress, splitToday, weekStart } from "./tasks.ts";
import type { Task } from "./types.ts";

const t = (name: string, date: string | null, status: Task["status"], planIds: string[] = []): Task => ({
  id: name, name, date, status, done: status === "完成", tag: null, planIds,
});

test("toTask maps Notion properties and folds Pending into not started", () => {
  const task = toTask({
    id: "t1",
    properties: {
      Name: { title: [{ plain_text: "寫週報" }] },
      Date: { date: { start: "2026-10-08" } },
      進度狀態: { status: { name: "Pending..." } },
      標籤: { select: { name: "重要！！" } },
      "🌕 月計畫": { relation: [{ id: "p1" }] },
    },
  });
  assert.deepEqual(task, { id: "t1", name: "寫週報", date: "2026-10-08", status: "未開始", done: false, tag: "重要！！", planIds: ["p1"] });
});

test("toPlan reads formula checkboxes", () => {
  const plan = toPlan({ id: "p", properties: { 項目: { title: [{ plain_text: "跑步" }] }, ThisMonth: { formula: { type: "boolean", boolean: true } } } });
  assert.equal(plan.thisMonth, true);
  assert.equal(plan.nextMonth, false);
});

test("taskProperties writes only the fields that changed", () => {
  assert.deepEqual(taskProperties({ status: "完成" }), { 進度狀態: { status: { name: "完成" } } });
  assert.deepEqual(taskProperties({ date: null }), { Date: { date: null } });
  assert.deepEqual(Object.keys(taskProperties({ name: "a", planId: "p" })), ["Name", "🌕 月計畫"]);
});

test("nextStatus cycles through three states", () => {
  assert.equal(nextStatus("未開始"), "進行中");
  assert.equal(nextStatus("進行中"), "完成");
  assert.equal(nextStatus("完成"), "未開始");
});

test("splitToday separates overdue open tasks from today's", () => {
  const { overdue, todays } = splitToday(
    [t("old", "2026-10-06", "未開始"), t("old-done", "2026-10-06", "完成"), t("now", "2026-10-08T09:00", "完成"), t("now2", "2026-10-08", "進行中"), t("later", "2026-10-09", "未開始"), t("none", null, "未開始")],
    "2026-10-08",
  );
  assert.deepEqual(overdue.map((x) => x.name), ["old"]);
  assert.deepEqual(todays.map((x) => x.name), ["now2", "now"]);
});

test("planProgress counts the plan's own tasks", () => {
  const p = { id: "p", title: "", status: "", type: null, start: null, end: null, thisMonth: true, nextMonth: false };
  const r = planProgress(p, [t("a", null, "完成", ["p"]), t("b", null, "未開始", ["p"]), t("c", null, "完成", ["q"])]);
  assert.equal(r.done, 1);
  assert.equal(r.total, 2);
});

test("weekStart returns Monday", () => {
  assert.equal(weekStart("2026-10-08"), "2026-10-05");
  assert.equal(weekStart("2026-10-11"), "2026-10-05");
  assert.equal(weekStart("2026-10-12"), "2026-10-12");
});
