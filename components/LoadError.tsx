export function LoadError() {
  return (
    <p className="rounded-lg border border-warn-soft bg-warn-soft p-4 text-warn">
      無法從 Notion 讀取資料。請確認 Vercel 的 NOTION_TOKEN 正確，而且兩個資料庫都已分享給你的 Integration。
    </p>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[13px] text-muted">{eyebrow}</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}
