import { cache } from "react";
import { mockStore } from "./mock.ts";
import { notionStore } from "./notion.ts";

const store = process.env.NOTION_MOCK === "1" ? mockStore : notionStore;

// Deduplicated per request, so the layout and the page share one Notion query.
export const listTasks = cache(() => store.listTasks());
export const listPlans = cache(() => store.listPlans());
export const { updateTask, createTask, deleteTask, createPlan } = store;
