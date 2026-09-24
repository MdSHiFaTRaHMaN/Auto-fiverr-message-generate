"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Sparkles, Layers, Info } from "lucide-react";
import { MessageType, Category } from "@/types";

interface MessageTypeSelectorProps {
  categories: Category[];
  messageTypes: MessageType[];
  selectedTypeId: string | null;
  onSelectType: (type: MessageType) => void;
}

export function MessageTypeSelector({
  categories,
  messageTypes,
  selectedTypeId,
  onSelectType,
}: MessageTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const selectedType = messageTypes.find((m) => m.id === selectedTypeId) || null;

  // Filter message types by search query
  const filteredTypes = messageTypes.filter((m) => {
    if (!m.enabled) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q))
    );
  });

  // Group filtered types by category
  const grouped = categories
    .map((cat) => ({
      category: cat,
      types: filteredTypes.filter((t) => t.categoryId === cat.id),
    }))
    .filter((g) => g.types.length > 0);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Select Message Type
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-left shadow-xs transition-all ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          {selectedType ? (
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {selectedType.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {categories.find((c) => c.id === selectedType.categoryId)?.name || "General"}
                </span>
              </div>
              {selectedType.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {selectedType.description}
                </p>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 dark:text-slate-500">
              Choose a message workflow (e.g. Meeting Follow-up, Order Extension)...
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search message type by name or keyword..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Grouped Options List */}
          <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
            {grouped.length > 0 ? (
              grouped.map(({ category, types }) => (
                <div key={category.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color || "#10b981" }}
                    />
                    {category.name}
                  </div>
                  <div className="mt-1 space-y-1">
                    {types.map((type) => {
                      const isSelected = type.id === selectedTypeId;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            onSelectType(type);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-sm ${
                            isSelected
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-medium">{type.name}</p>
                            {type.description && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {type.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                No matching message types found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Type Info Card */}
      {selectedType && (
        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Info className="w-3.5 h-3.5" />
              Active Workflow Guidelines:
            </span>
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
              {selectedType.rules?.length || 0} active rules • {selectedType.examples?.length || 0} examples
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Style: </span>
            {selectedType.writingStyle.replace(/\n/g, ", ").replace(/^- /g, "")}
          </p>
        </div>
      )}
    </div>
  );
}
