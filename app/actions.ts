"use server";

import { revalidatePath } from "next/cache";
import { todayInTaipei } from "@/lib/dates";
import { requireLogin } from "@/lib/session";
import { createPlan, createTask, deleteTask, updateTask } from "@/lib/store";
import type { TaskStatus } from "@/lib/types";

async function done() {
  revalidatePath("/", "layout");
}

export async function setStatus(id: string, status: TaskStatus) {
  await requireLogin();
  await updateTask(id, { status });
  await done();
}

export async function setDate(id: string, date: string | null) {
  await requireLogin();
  await updateTask(id, { date });
  await done();
}

export async function moveToToday(ids: string[]) {
  await requireLogin();
  const today = todayInTaipei();
  for (const id of ids) await updateTask(id, { date: today });
  await done();
}

export async function removeTask(id: string) {
  await requireLogin();
  await deleteTask(id);
  await done();
}

export async function addTask(formData: FormData) {
  await requireLogin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const date = String(formData.get("date") ?? "") || null;
  const planId = String(formData.get("planId") ?? "") || null;
  await createTask({ name, date, planId });
  await done();
}

export async function addPlan(formData: FormData) {
  await requireLogin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await createPlan({
    title,
    start: String(formData.get("start") ?? "") || null,
    end: String(formData.get("end") ?? "") || null,
    type: String(formData.get("type") ?? "") || null,
  });
  await done();
}
