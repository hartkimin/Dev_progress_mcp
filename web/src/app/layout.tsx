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
  title: "Vibe Coding Planner",
  description: "A guided planner for vibe-coding beginners",
};

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
              <Sidebar />
              <div className="flex-1 overflow-y-auto w-full h-full relative">
                <TopNav />
                {children}
              </div>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

