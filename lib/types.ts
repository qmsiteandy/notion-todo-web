export type TaskStatus = "未開始" | "進行中" | "完成";

export type Task = {
  id: string;
  name: string;
  date: string | null;
  status: TaskStatus;
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
  thisMonth: boolean;
  nextMonth: boolean;
};

export type TaskPatch = { name?: string; date?: string | null; status?: TaskStatus; tag?: string | null };
export type NewTask = { name: string; date?: string | null; planId?: string | null; tag?: string | null };
export type NewPlan = { title: string; start?: string | null; end?: string | null; type?: string | null };

export const TAGS = ["月計畫", "挑戰⭐", "重要！！", "SideProject"];
export const PLAN_TYPES = ["年度目標⭐", "生活興趣", "日常 Side🧑‍💻", "職涯 side 📚", "月重點"];
