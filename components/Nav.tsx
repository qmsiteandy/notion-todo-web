"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoardIcon, PlanIcon, PlansIcon, TodayIcon } from "./icons";

const ITEMS = [
  { href: "/", label: "今天", Icon: TodayIcon },
  { href: "/plan", label: "規劃", Icon: PlanIcon },
  { href: "/tasks", label: "全部任務", Icon: BoardIcon },
  { href: "/plans", label: "月計畫", Icon: PlansIcon },
];

export function SideNav({ counts }: { counts: Record<string, number | undefined> }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-green-hi ${
              active ? "bg-navy-active font-bold text-green-hi" : "text-side hover:bg-navy-2"
            }`}
          >
            <Icon />
            <span className="flex-1">{label}</span>
            {counts[href] !== undefined && (
              <span className={`font-mono text-xs ${active ? "" : "text-side-muted"}`}>{counts[href]}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-navy-2 bg-navy pb-[env(safe-area-inset-bottom)] md:hidden">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${active ? "font-bold text-green-hi" : "text-side"}`}
          >
            <Icon className="size-[22px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
