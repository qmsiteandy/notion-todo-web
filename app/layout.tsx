import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "我的待辦" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
