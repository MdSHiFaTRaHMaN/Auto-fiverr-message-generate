"use client";

import React from "react";
import { Menu, Sun, Moon, Laptop, Keyboard, Sparkles, ExternalLink } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface HeaderProps {
  onOpenMobile: () => void;
  onOpenShortcuts: () => void;
  currentModel?: string;
}

export function Header({
  onOpenMobile,
  onOpenShortcuts,
  currentModel = "gpt-4o-mini",
}: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  return (
    <header className="h-16 px-4 lg:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Fiverr Client Assistant Active
          </span>
        </div>
      </div>

      {/* Right: Actions, AI Model indicator, Shortcuts, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model Indicator Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>{currentModel}</span>
        </div>

        {/* Shortcuts Button */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Theme: ${theme}. Click to switch.`}
          aria-label="Toggle theme"
        >
          {theme === "light" && <Sun className="w-4 h-4 text-amber-500" />}
          {theme === "dark" && <Moon className="w-4 h-4 text-blue-400" />}
          {theme === "system" && <Laptop className="w-4 h-4 text-emerald-500" />}
        </button>

        {/* Fiverr Quick Launch */}
        <a
          href="https://www.fiverr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-700/20 transition-all hover:scale-102"
        >
          <span>Fiverr</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </header>
  );
}
