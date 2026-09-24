import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fiverr AI Message Assistant | Professional Client Communication",
  description:
    "AI-powered message generator designed for Fiverr and Shopify web developers. Select workflow, paste details, and generate polished client messages in seconds.",
  keywords: [
    "Fiverr AI Assistant",
    "Fiverr client message generator",
    "Shopify developer messages",
    "Fiverr order extension message",
    "Fiverr meeting follow up",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
