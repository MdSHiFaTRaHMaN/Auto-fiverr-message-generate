"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageType, Category } from "@/types";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MessageTypeModal } from "@/components/message-types/MessageTypeModal";
import { ShortcutsModal } from "@/components/dashboard/ShortcutsModal";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Search,
  Layers,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
} from "lucide-react";

export default function MessageTypesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Active" | "Disabled">("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<MessageType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [catsRes, typesRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/message-types"),
      ]);
      const cats = await catsRes.json();
      const types = await typesRes.json();
      if (cats.success) setCategories(cats.data);
      if (types.success) setMessageTypes(types.data);
    } catch (err) {
      console.error("Failed to load message types:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Duplicate handler
  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/message-types/${id}/duplicate`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        showToast("Workflow duplicated successfully!", "success");
        loadData();
      } else {
        showToast(json.error || "Failed to duplicate workflow.", "error");
      }
    } catch {
      showToast("Error duplicating workflow.", "error");
    }
  };

  // Toggle enabled handler
  const handleToggleEnabled = async (type: MessageType) => {
    try {
      const res = await fetch(`/api/message-types/${type.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !type.enabled }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          !type.enabled ? `"${type.name}" enabled.` : `"${type.name}" disabled.`,
          "info"
        );
        setMessageTypes((prev) =>
          prev.map((t) => (t.id === type.id ? { ...t, enabled: !t.enabled } : t))
        );
      }
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/message-types/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("Workflow deleted.", "success");
        setMessageTypes((prev) => prev.filter((t) => t.id !== id));
        setDeleteConfirmId(null);
      } else {
        showToast(json.error || "Failed to delete.", "error");
      }
    } catch {
      showToast("Error deleting workflow.", "error");
    }
  };

  // Filter logic
  const filteredTypes = messageTypes.filter((mt) => {
    if (selectedCategoryFilter !== "All") {
      const cat = categories.find((c) => c.name.toLowerCase() === selectedCategoryFilter.toLowerCase());
      if (cat && mt.categoryId !== cat.id) return false;
    }
    if (selectedStatusFilter === "Active" && !mt.enabled) return false;
    if (selectedStatusFilter === "Disabled" && mt.enabled) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        mt.name.toLowerCase().includes(q) ||
        (mt.description && mt.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

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
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Message Types & Workflows
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Customize predefined rules, writing style, step-by-step structures, and examples.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingType(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Message Type</span>
            </button>
          </div>

          {/* Controls / Filter Bar */}
          <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows by title or description..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Disabled">Disabled Only</option>
              </select>
            </div>
          </div>

          {/* Grid of Message Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTypes.length > 0 ? (
              filteredTypes.map((mt) => {
                const cat = categories.find((c) => c.id === mt.categoryId);
                return (
                  <div
                    key={mt.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between hover:shadow-md ${
                      mt.enabled
                        ? "border-slate-200/90 dark:border-slate-800/80"
                        : "border-slate-200/50 dark:border-slate-800/40 opacity-70"
                    }`}
                  >
                    <div>
                      {/* Top badges & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: cat?.color || "#10b981" }}
                        >
                          {cat?.name || "General"}
                        </span>
                        <button
                          onClick={() => handleToggleEnabled(mt)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                            mt.enabled
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}
                          title="Click to toggle status"
                        >
                          {mt.enabled ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {mt.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {mt.description || "No description provided."}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{mt.rules?.length || 0} rules</span>
                        <span>•</span>
                        <span>{mt.examples?.length || 0} examples</span>
                        <span>•</span>
                        <span className="capitalize">{mt.outputFormat.replace("_", " ")}</span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingType(mt);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Edit workflow"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDuplicate(mt.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Duplicate workflow"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>
                      </div>

                      {deleteConfirmId === mt.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(mt.id)}
                            className="px-2 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-md hover:bg-rose-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(mt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Delete message type"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-8">
                <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  No message types found
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                  Create your first customized workflow to automate your client communication.
                </p>
                <button
                  onClick={() => {
                    setEditingType(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  Create Message Type
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create / Edit Modal */}
      <MessageTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadData}
        categories={categories}
        initialData={editingType}
      />

      {/* Keyboard Shortcuts Helper */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
