export function ProgressBar({ ratio, tone = "green", className = "" }: { ratio: number; tone?: "green" | "warn" | "hi"; className?: string }) {
  const fill = tone === "warn" ? "bg-warn" : tone === "hi" ? "bg-green-hi" : "bg-green";
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-line ${className}`}>
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
    </div>
  );
}
