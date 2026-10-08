type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

export const TodayIcon = ({ className = "size-[18px]" }: P) => (
  <svg {...base} className={className} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const PlanIcon = ({ className = "size-[18px]" }: P) => (
  <svg {...base} className={className} aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
export const BoardIcon = ({ className = "size-[18px]" }: P) => (
  <svg {...base} className={className} aria-hidden="true"><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="10" rx="1.5" /><rect x="17" y="4" width="4" height="6" rx="1.5" /></svg>
);
export const PlansIcon = ({ className = "size-[18px]" }: P) => (
  <svg {...base} className={className} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 9 9h-9z" fill="currentColor" /></svg>
);
export const PlusIcon = ({ className = "size-[15px]" }: P) => (
  <svg {...base} strokeWidth={2.6} className={className} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
export const CheckIcon = ({ className = "size-[11px]" }: P) => (
  <svg {...base} strokeWidth={4} className={className} aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
);
export const ChevronIcon = ({ className = "size-4" }: P) => (
  <svg {...base} strokeWidth={2.6} className={className} aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
export const TrashIcon = ({ className = "size-4" }: P) => (
  <svg {...base} className={className} aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" /></svg>
);
export const Logo = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d="M12 2c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" fill="#00ed64" /><path d="M12 10v12" stroke="#001e2b" strokeWidth="1.6" /></svg>
);
