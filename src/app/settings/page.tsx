"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ShortcutsModal } from "@/components/dashboard/ShortcutsModal";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import {
  Settings,
  Cpu,
  Sliders,
  Palette,
  CheckCircle2,
  AlertCircle,
  Database,
  Key,
  RotateCcw,
  Save,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(600);
  const [signature, setSignature] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Status flags from backend
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [isMongoConfigured, setIsMongoConfigured] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-3.5-turbo",
  ]);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const s = json.data.settings;
          if (s) {
            setProvider(s.provider || "openai");
            setModel(s.model || "gpt-4o-mini");
            setTemperature(s.temperature ?? 0.7);
            setMaxTokens(s.maxTokens ?? 600);
            setSignature(s.signature || "");
          }
          if (json.data.systemStatus) {
            setIsApiKeyConfigured(json.data.systemStatus.isApiKeyConfigured);
            setIsMongoConfigured(json.data.systemStatus.isMongoConfigured);
            if (json.data.systemStatus.availableModels) {
              setAvailableModels(json.data.systemStatus.availableModels);
            }
          }
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          temperature,
          maxTokens,
          signature,
          theme,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Settings updated successfully!", "success");
      } else {
        showToast("Failed to save settings.", "error");
      }
    } catch {
      showToast("Error updating settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("This will restore default categories and sample workflows. Proceed?")) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("Default workflows seeded successfully!", "success");
      } else {
        showToast("Failed to re-seed defaults.", "error");
      }
    } catch {
      showToast("Error restoring defaults.", "error");
    } finally {
      setIsSeeding(false);
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
          currentModel={model}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              System Settings & AI Configuration
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure your AI generation parameters, system theme, and developer signature.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* System Status Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500" />
                Connection & Service Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OpenAI API Key status */}
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isApiKeyConfigured ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"}`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        OpenAI API Key:
                      </span>
                      {isApiKeyConfigured ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Active & Connected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Built-in Engine Mode
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isApiKeyConfigured
                        ? "Requests are processed securely via official OpenAI models."
                        : "No API key detected in .env.local. The assistant is operating using its built-in smart template engine. Add OPENAI_API_KEY in .env.local to activate live GPT models."}
                    </p>
                  </div>
                </div>

                {/* Database status */}
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Database Engine:
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {isMongoConfigured ? "MongoDB Atlas / Server" : "Local Persistent JSON"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isMongoConfigured
                        ? "Storage connected to MongoDB with automatic indexes."
                        : "Operating in fast local file persistence mode (.data/store.json). To connect to MongoDB, supply MONGODB_URI in .env.local."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Model Parameters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-500" />
                AI Model & Generation Parameters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Provider */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    AI Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => {
                      const newP = e.target.value as "openai" | "gemini";
                      setProvider(newP);
                      if (newP === "gemini") setModel("gemini-1.5-flash");
                      else setModel("gpt-4o-mini");
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                  >
                    <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
                    <option value="gemini">Google Gemini (100% Free - No Credit Card Needed)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {provider === "gemini" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Get your free Gemini Key from{" "}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold"
                        >
                          Google AI Studio
                        </a>{" "}
                        and add `GEMINI_API_KEY=` to `.env.local`.
                      </span>
                    ) : (
                      "Requires paid credits at platform.openai.com/billing."
                    )}
                  </p>
                </div>

                {/* AI Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Model Selection
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                  >
                    {provider === "openai" ? (
                      <>
                        <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost-Efficient)</option>
                        <option value="gpt-4o">gpt-4o (Most Capable)</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                      </>
                    ) : (
                      <>
                        <option value="gemini-1.5-flash">gemini-1.5-flash (Free, Ultra-Fast)</option>
                        <option value="gemini-2.0-flash">gemini-2.0-flash (Free, Next-Gen)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Max Tokens & Temperature */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Max Tokens */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Maximum Output Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min="150"
                    max="1500"
                    step="50"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>150 (Brief)</span>
                    <span>600 (Standard)</span>
                    <span>1500 (Comprehensive)</span>
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Creativity / Temperature: <span className="font-mono text-emerald-600 dark:text-emerald-400">{temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>0.0 (Precise)</span>
                    <span>0.7 (Natural Tone)</span>
                    <span>1.0 (Creative)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance / Theme */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-500" />
                Appearance
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    theme === "light"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    theme === "dark"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Moon className="w-5 h-5 text-blue-400" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    theme === "system"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Laptop className="w-5 h-5 text-emerald-500" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Custom Signature */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Default Developer Sign-Off / Signature
              </h2>
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={3}
                placeholder="Best regards,&#10;John | Shopify & Full-Stack Web Developer"
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400">
                This sign-off will automatically be incorporated into generated Fiverr messages where appropriate.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={isSeeding}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                <span>Re-seed Default Workflows</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-102"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving Settings..." : "Save Preferences"}</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
