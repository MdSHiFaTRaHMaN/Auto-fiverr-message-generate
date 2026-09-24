"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Category, MessageType } from "@/types";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ShortcutsModal } from "@/components/dashboard/ShortcutsModal";
import { useToast } from "@/components/ui/Toast";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#10b981");

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Deletion guard modal
  const [blockedDeleteWarning, setBlockedDeleteWarning] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [catRes, typeRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/message-types"),
      ]);
      const cats = await catRes.json();
      const types = await typeRes.json();
      if (cats.success) setCategories(cats.data);
      if (types.success) setMessageTypes(types.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartCreate = () => {
    setName("");
    setDescription("");
    setColor("#10b981");
    setEditingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (cat: Category) => {
    setName(cat.name);
    setDescription(cat.description || "");
    setColor(cat.color || "#10b981");
    setIsCreating(false);
    setEditingId(cat.id);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setName("");
    setDescription("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (isCreating) {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim(), color }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Category created!", "success");
          handleCancel();
          loadData();
        } else {
          showToast(json.error || "Failed to create category", "error");
        }
      } else if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim(), color }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Category updated!", "success");
          handleCancel();
          loadData();
        } else {
          showToast(json.error || "Failed to update category", "error");
        }
      }
    } catch {
      showToast("Error saving category.", "error");
    }
  };

  const handleDelete = async (cat: Category) => {
    const activeCount = messageTypes.filter((m) => m.categoryId === cat.id).length;
    if (activeCount > 0) {
      setBlockedDeleteWarning(
        `Category "${cat.name}" cannot be deleted because it currently contains ${activeCount} active Message Type(s). Please move or delete those workflows first.`
      );
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("Category deleted.", "success");
        loadData();
      } else {
        showToast(json.error || "Failed to delete category.", "error");
      }
    } catch {
      showToast("Error deleting category.", "error");
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

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Categories
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Organize your Fiverr workflows into structured categories.
              </p>
            </div>
            {!isCreating && !editingId && (
              <button
                onClick={handleStartCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            )}
          </div>

          {/* Create / Edit Form */}
          {(isCreating || editingId) && (
            <div className="mb-6 bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                {isCreating ? "Create New Category" : "Edit Category"}
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Client Approvals"
                      required
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Messages requesting client approval"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Badge Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-24 px-2 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Category</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat) => {
                const count = messageTypes.filter((m) => m.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color || "#10b981" }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {cat.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {count} workflows
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Blocked Delete Alert Modal */}
      {blockedDeleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Cannot Delete Category
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {blockedDeleteWarning}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setBlockedDeleteWarning(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Understood
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
