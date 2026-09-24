"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageType, Category, GenerationHistory } from "@/types";
import { MessageTypeSelector } from "@/components/dashboard/MessageTypeSelector";
import { InputSection } from "@/components/dashboard/InputSection";
import { GeneratedMessageEditor } from "@/components/dashboard/GeneratedMessageEditor";
import { ShortcutsModal } from "@/components/dashboard/ShortcutsModal";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToast } from "@/components/ui/Toast";
import {
  Sparkles,
  RotateCw,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  SendHorizontal,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([]);
  const [selectedType, setSelectedType] = useState<MessageType | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentHistory, setRecentHistory] = useState<GenerationHistory[]>([]);
  const [activeModel, setActiveModel] = useState("gpt-4o-mini");
  const [generationMeta, setGenerationMeta] = useState<{
    modelUsed?: string;
    tokensUsed?: number;
    fallbackReason?: string;
  }>({});

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [copiedRecentId, setCopiedRecentId] = useState<string | null>(null);

  const { showToast } = useToast();

  // Load initial data
  const fetchData = useCallback(async () => {
    try {
      const [catsRes, typesRes, histRes, settingsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/message-types"),
        fetch("/api/history?limit=5"),
        fetch("/api/settings"),
      ]);

      const catsData = await catsRes.json();
      const typesData = await typesRes.json();
      const histData = await histRes.json();
      const settingsData = await settingsRes.json();

      if (catsData.success) setCategories(catsData.data);
      if (typesData.success) {
        setMessageTypes(typesData.data);
        // Default to "Meeting Follow-up" or first available
        const defaultType =
          typesData.data.find((t: MessageType) => t.name.toLowerCase().includes("follow-up")) ||
          typesData.data[0];
        if (defaultType && !selectedType) {
          setSelectedType(defaultType);
        }
      }
      if (histData.success) setRecentHistory(histData.data);
      if (settingsData.success && settingsData.data?.settings?.model) {
        setActiveModel(settingsData.data.settings.model);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Main Generation Action
  const handleGenerate = async () => {
    if (!selectedType) {
      showToast("Please select a Message Type first.", "info");
      return;
    }
    if (!input.trim()) {
      showToast("Please paste or type the client situation first.", "info");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageTypeId: selectedType.id,
          input: input.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Generation request failed");
      }

      setOutput(json.data.output);
      setGenerationMeta({
        modelUsed: json.data.modelUsed,
        tokensUsed: json.data.tokensUsed,
        fallbackReason: json.data.fallbackReason,
      });

      if (json.data.fallbackReason) {
        showToast("Message generated using smart assistant engine.", "info");
      } else {
        showToast("Fiverr message generated successfully!", "success");
      }

      // Refresh recent history
      const histRes = await fetch("/api/history?limit=5");
      const histData = await histRes.json();
      if (histData.success) setRecentHistory(histData.data);
    } catch (err: any) {
      showToast(err.message || "Failed to generate message.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + Enter -> Generate
      if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleGenerate();
        return;
      }

      // Ctrl + Shift + C -> Copy output
      if (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        if (output.trim()) {
          navigator.clipboard.writeText(output);
          showToast("Message copied to clipboard!", "success");
        }
        return;
      }

      // '?' open shortcuts modal when not inside an input or textarea
      if (
        e.key === "?" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleCopyRecent = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecentId(id);
      showToast("Copied from history!", "success");
      setTimeout(() => setCopiedRecentId(null), 2000);
    } catch {
      showToast("Unable to copy text.", "error");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobile={() => setIsMobileOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          currentModel={activeModel}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner / Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Fiverr AI Message Generator
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select your predefined workflow, paste the client details, and copy your polished response.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/message-types"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Manage Workflows</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left / Generator Main Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 lg:p-6 shadow-xs space-y-5">
                {/* 1. Message Type Selector */}
                <MessageTypeSelector
                  categories={categories}
                  messageTypes={messageTypes}
                  selectedTypeId={selectedType?.id || null}
                  onSelectType={(type) => setSelectedType(type)}
                />

                {/* 2. Input Section */}
                <InputSection
                  input={input}
                  onChangeInput={setInput}
                  disabled={isGenerating}
                />

                {/* 3. Primary CTA: Generate Button */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <span className="hidden sm:inline-block text-xs text-slate-400">
                    Shortcut: <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 border rounded">Ctrl+Shift+Enter</kbd>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !input.trim() || !selectedType}
                    className="w-full sm:w-auto ml-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Generating Fiverr Message...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Message</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 4. Generated Message Area */}
                {(output || isGenerating) && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    {generationMeta.fallbackReason && (
                      <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start justify-between gap-2.5 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-bold">Notice: </span>
                            {generationMeta.fallbackReason}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGenerationMeta((prev) => ({ ...prev, fallbackReason: undefined }))}
                          className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md text-amber-600 dark:text-amber-400 shrink-0 transition-colors"
                          title="Dismiss notice"
                        >
                          <span className="sr-only">Dismiss</span>
                          ✕
                        </button>
                      </div>
                    )}
                    <GeneratedMessageEditor
                      output={output}
                      onChangeOutput={setOutput}
                      onRegenerate={handleGenerate}
                      onClear={() => setOutput("")}
                      isGenerating={isGenerating}
                      modelUsed={generationMeta.modelUsed}
                      tokensUsed={generationMeta.tokensUsed}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right / Quick Reference & Recent History Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Workflow Details Card */}
              {selectedType && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Workflow Blueprint
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedType.outputFormat === "markdown" ? "Markdown" : "Plain Text"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Structure:</span>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-[11px] leading-relaxed">
                        {selectedType.messageStructure || "Natural concise structure."}
                      </p>
                    </div>

                    {selectedType.rules && selectedType.rules.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Active Rules:</span>
                        <ul className="mt-1 space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                          {selectedType.rules.slice(0, 4).map((r, i) => (
                            <li key={i} className="truncate">{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Generations Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent Generations</span>
                  </div>
                  <Link
                    href="/history"
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentHistory.length > 0 ? (
                    recentHistory.map((item) => (
                      <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                            {item.messageTypeName}
                          </span>
                          <button
                            onClick={() => handleCopyRecent(item.output, item.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:text-emerald-600 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Copy output"
                          >
                            {copiedRecentId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.output}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      No messages generated yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
