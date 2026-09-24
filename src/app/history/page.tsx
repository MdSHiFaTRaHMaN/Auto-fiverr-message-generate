"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GenerationHistory, Category } from "@/types";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ShortcutsModal } from "@/components/dashboard/ShortcutsModal";
import { useToast } from "@/components/ui/Toast";
import {
  History,
  Search,
  Copy,
  Check,
  Trash2,
  Calendar,
  Filter,
  Eye,
  X,
  FileText,
  Sparkles,
} from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GenerationHistory | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [histRes, catRes] = await Promise.all([
        fetch(`/api/history?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`),
        fetch("/api/categories"),
      ]);
      const hist = await histRes.json();
      const cats = await catRes.json();
      if (hist.success) setHistory(hist.data);
      if (cats.success) setCategories(cats.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("Unable to copy.", "error");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("History record removed.", "info");
        setHistory((prev) => prev.filter((h) => h.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
      }
    } catch {
      showToast("Error deleting item.", "error");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear your entire message history?")) {
      return;
    }
    setIsClearing(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("History cleared.", "success");
        setHistory([]);
        setSelectedItem(null);
      }
    } catch {
      showToast("Error clearing history.", "error");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobile={() => setIsMobileOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Top Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Generation History
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Browse and reuse all previously generated client messages.
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history by content, message type..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.messageTypeName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        {item.categoryName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.modelUsed}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                        Original Situation Input:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {item.input}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/20">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] block mb-1">
                        Generated Fiverr Response:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {item.output}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleCopy(item.output, item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-8">
                <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  No messages generated yet
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                  Your generated client messages will automatically be recorded here for fast access and copying.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedItem.messageTypeName}
                </h3>
                <p className="text-xs text-slate-400">
                  Category: {selectedItem.categoryName} • {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Situation Input:
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                  {selectedItem.input}
                </div>
              </div>

              <div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Generated Fiverr Message:
                </span>
                <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-xl whitespace-pre-line text-slate-900 dark:text-slate-100 leading-relaxed font-sans text-sm">
                  {selectedItem.output}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleCopy(selectedItem.output, selectedItem.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
