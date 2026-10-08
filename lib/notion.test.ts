import assert from "node:assert/strict";
import { test } from "node:test";
import { isActivePlan, toPlan, toTask } from "./notion.ts";

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
  assert.deepEqual(task, {
    id: "t1",
    name: "寫週報",
    date: "2026-10-08",
    status: "未開始",
    done: false,
    tag: "重要！！",
    planIds: ["p1"],
  });
});

test("toPlan reads rollups and isActivePlan hides finished plans", () => {
  const plan = toPlan({
    id: "p1",
    properties: {
      項目: { title: [{ plain_text: "學英文" }] },
      Status: { status: { name: "進行中..." } },
      類型: { select: { name: "月重點" } },
      期間: { date: { start: "2026-10-01", end: "2026-10-31" } },
      任務數: { rollup: { type: "number", number: 4 } },
      完成度: { rollup: { type: "number", number: 0.25 } },
    },
  });
  assert.equal(plan.progress, 0.25);
  assert.equal(plan.taskCount, 4);
  assert.equal(isActivePlan(plan), true);
  assert.equal(isActivePlan({ ...plan, status: "完成🏆" }), false);
  assert.equal(isActivePlan({ ...plan, status: "取消🥲" }), false);
});
