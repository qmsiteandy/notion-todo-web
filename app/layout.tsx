import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "我的待辦" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#001e2b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-screen font-sans text-sm antialiased">{children}</body>
    </html>
  );
}
