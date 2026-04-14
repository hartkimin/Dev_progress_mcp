import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VibePlanner - AI-Powered Project Management",
    template: "%s | VibePlanner"
  },
  description: "Plan, track, and execute projects with the power of AI and Vibe Coding.",
  keywords: ["project management", "AI", "productivity", "vibe coding", "task tracker"],
  openGraph: {
    title: "VibePlanner",
    description: "The modern project planner for AI-first teams.",
    url: "https://vibeplanner.io",
    siteName: "VibePlanner",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/components/AuthProvider";
import SyncAuth from "@/components/SyncAuth";
import AiSidebar from "@/components/AiSidebar";
import CommandPalette from "@/components/CommandPalette";
import { listProjects } from "@/lib/db";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Best-effort project list for the sidebar. Fails silently on unauthed
  // pages (signin etc.) — Sidebar handles empty list gracefully.
  let sidebarProjects: { id: string; name: string }[] = [];
  try {
    const rows = await listProjects();
    sidebarProjects = rows.map(p => ({ id: p.id, name: p.name }));
  } catch {
    /* noop */
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SyncAuth />
          <AiSidebar />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
                <Sidebar projects={sidebarProjects} />
                <CommandPalette projects={sidebarProjects} />
                <div className="flex-1 overflow-y-auto w-full h-full relative flex flex-col">
                  <TopNav />
                  <div className="flex-1">
                    {children}
                  </div>
                  <footer className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500 flex flex-wrap items-center justify-center gap-3">
                    <span>VibePlanner · self-hosted</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">⌘K</kbd>
                    <span>quick nav</span>
                  </footer>
                </div>
              </div>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
