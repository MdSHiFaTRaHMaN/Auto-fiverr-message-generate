"use client";

import React, { useRef } from "react";
import { ClipboardPaste, Trash2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface InputSectionProps {
  input: string;
  onChangeInput: (val: string) => void;
  disabled?: boolean;
}

export function InputSection({
  input,
  onChangeInput,
  disabled = false,
}: InputSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onChangeInput(text);
          showToast("Pasted from clipboard", "success");
        } else {
          showToast("Clipboard is empty.", "info");
        }
      } else {
        showToast("Clipboard access is unavailable. Please use Ctrl + V.", "info");
      }
    } catch {
      showToast("Clipboard access is unavailable. Please use Ctrl + V.", "info");
    }
  };

  const handleClear = () => {
    onChangeInput("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const charCount = input.length;
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="client-situation-input"
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Input Situation / Client Information
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste</span>
          </button>
          {input.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          id="client-situation-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          disabled={disabled}
          placeholder="Paste or type the information here... (e.g. 'We had a meeting scheduled today. Client has not replied yet.')"
          rows={6}
          className="w-full p-4 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-y transition-all leading-relaxed"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 pt-1.5">
          <span>Tip: Press Ctrl + Shift + Enter to generate instantly</span>
          <span className="font-mono">
            {wordCount} words • {charCount} chars
          </span>
        </div>
      </div>
    </div>
  );
}
