"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCw, Trash2, Edit3, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface GeneratedMessageEditorProps {
  output: string;
  onChangeOutput: (val: string) => void;
  onRegenerate: () => void;
  onClear: () => void;
  isGenerating?: boolean;
  modelUsed?: string;
  tokensUsed?: number;
}

export function GeneratedMessageEditor({
  output,
  onChangeOutput,
  onRegenerate,
  onClear,
  isGenerating = false,
  modelUsed,
  tokensUsed,
}: GeneratedMessageEditorProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    if (!output.trim()) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(output);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = output;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast("Message copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Unable to copy to clipboard automatically.", "error");
    }
  };

  const charCount = output.length;
  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full flex flex-col pt-2">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor="generated-message-output"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Generated Fiverr Message
          </label>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
            <Edit3 className="w-3 h-3" />
            Editable
          </span>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Regenerate message with same parameters"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={isGenerating}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Clear output"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={isGenerating || !output.trim()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:scale-102"
            } disabled:opacity-50 disabled:pointer-events-none`}
            title="Copy message (Ctrl + Shift + C)"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable Area */}
      <div className="relative">
        <textarea
          id="generated-message-output"
          value={output}
          onChange={(e) => onChangeOutput(e.target.value)}
          rows={8}
          className="w-full p-4 text-sm font-normal bg-emerald-50/20 dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 rounded-xl shadow-xs focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-y transition-all leading-relaxed"
          placeholder="Your AI-generated Fiverr message will appear here..."
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 pt-1.5">
          <div className="flex items-center gap-2">
            <span>Shortcut: Ctrl + Shift + C to copy</span>
            {modelUsed && (
              <span className="hidden md:inline text-slate-400 font-mono text-[10px]">
                • Model: {modelUsed} {tokensUsed ? `(${tokensUsed} tokens)` : ""}
              </span>
            )}
          </div>
          <span className="font-mono">
            {wordCount} words • {charCount} chars
          </span>
        </div>
      </div>
    </div>
  );
}
