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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
                <Sidebar />
                <div className="flex-1 overflow-y-auto w-full h-full relative flex flex-col">
                  <TopNav />
                  <div className="flex-1">
                    {children}
                  </div>
                  <footer className="p-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                    <div className="flex justify-center gap-6 mb-2">
                      <a href="/terms" className="hover:text-indigo-500 transition-colors">Terms</a>
                      <a href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy</a>
                      <a href="mailto:support@vibeplanner.io" className="hover:text-indigo-500 transition-colors">Support</a>
                    </div>
                    <p>© 2026 VibePlanner Inc. All rights reserved.</p>
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
