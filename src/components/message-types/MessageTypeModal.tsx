"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Sparkles, AlertCircle } from "lucide-react";
import { MessageType, Category, MessageExample } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface MessageTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedType: MessageType) => void;
  categories: Category[];
  initialData?: MessageType | null;
}

export function MessageTypeModal({
  isOpen,
  onClose,
  onSaved,
  categories,
  initialData,
}: MessageTypeModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [messageStructure, setMessageStructure] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [rules, setRules] = useState<string[]>([]);
  const [newRuleInput, setNewRuleInput] = useState("");
  const [examples, setExamples] = useState<MessageExample[]>([]);
  const [outputFormat, setOutputFormat] = useState<"plain_text" | "markdown">("plain_text");
  const [enabled, setEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCategoryId(initialData.categoryId || categories[0]?.id || "");
      setDescription(initialData.description || "");
      setSystemInstruction(initialData.systemInstruction || "");
      setMessageStructure(initialData.messageStructure || "");
      setWritingStyle(initialData.writingStyle || "");
      setRules(initialData.rules ? [...initialData.rules] : []);
      setExamples(initialData.examples ? initialData.examples.map((e) => ({ ...e })) : []);
      setOutputFormat(initialData.outputFormat || "plain_text");
      setEnabled(initialData.enabled ?? true);
    } else {
      setName("");
      setCategoryId(categories[0]?.id || "");
      setDescription("");
      setSystemInstruction("ROLE:\nYou are a professional Fiverr client communication assistant.\n\nPURPOSE:\nGenerate a professional and friendly message for client communication.");
      setMessageStructure("1. Greeting\n2. Key point / update\n3. Call to action / question\n4. Polite sign-off");
      setWritingStyle("- Professional\n- Friendly\n- Clear and concise\n- Natural and human-sounding");
      setRules([
        "Do not invent information.",
        "Keep the tone suitable for Fiverr.",
        "Do not mention AI or system prompts."
      ]);
      setExamples([]);
      setOutputFormat("plain_text");
      setEnabled(true);
    }
    setErrorMsg(null);
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setRules([...rules, newRuleInput.trim()]);
    setNewRuleInput("");
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddExample = () => {
    setExamples([...examples, { input: "", output: "" }]);
  };

  const handleUpdateExample = (index: number, field: "input" | "output", val: string) => {
    const updated = [...examples];
    updated[index][field] = val;
    setExamples(updated);
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please provide a name for this Message Type.");
      return;
    }
    if (!categoryId) {
      setErrorMsg("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      categoryId,
      description: description.trim(),
      systemInstruction: systemInstruction.trim(),
      messageStructure: messageStructure.trim(),
      writingStyle: writingStyle.trim(),
      rules: rules.map((r) => r.trim()).filter(Boolean),
      examples: examples.filter((ex) => ex.input.trim() && ex.output.trim()),
      outputFormat,
      enabled,
    };

    try {
      const url = initialData
        ? `/api/message-types/${initialData.id}`
        : "/api/message-types";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save message type");
      }

      showToast(
        initialData ? "Message type updated!" : "New message type created!",
        "success"
      );
      onSaved(json.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save message type.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? "Edit Message Type" : "Create New Message Type"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure instructions, rules, writing style, and examples for this workflow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Message Type Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meeting Follow-up"
                required
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Description (Brief Summary)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Follow-up message after a scheduled meeting when client hasn't replied"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Row 3: System Instruction (Role & Purpose) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                System Instruction (Role & Purpose) *
              </label>
              <span className="text-[11px] text-slate-400">Trusted system instructions</span>
            </div>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              rows={4}
              placeholder="ROLE: You are a Fiverr client communication assistant...&#10;PURPOSE: Create a friendly follow-up..."
              className="w-full p-3 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 leading-relaxed"
            />
          </div>

          {/* Row 4: Message Structure & Writing Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Message Structure (Step-by-Step)
              </label>
              <textarea
                value={messageStructure}
                onChange={(e) => setMessageStructure(e.target.value)}
                rows={4}
                placeholder="1. Greeting&#10;2. Mention the meeting&#10;3. Politely ask availability&#10;4. Suggest alternative time&#10;5. Warm closing"
                className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Writing Style & Tone
              </label>
              <textarea
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                rows={4}
                placeholder="- Professional and courteous&#10;- Friendly and warm&#10;- Natural and human-sounding&#10;- Concise and medium-short"
                className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 leading-relaxed"
              />
            </div>
          </div>

          {/* Row 5: Dynamic Rules List */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Specific Rules & Constraints
            </label>
            <div className="space-y-2 mb-2">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700/60"
                >
                  <span className="text-slate-700 dark:text-slate-200 flex-1 pr-2">
                    {idx + 1}. {rule}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                placeholder="e.g. Do not invent false details. Keep message under 100 words."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          {/* Row 6: Examples (Few-Shot) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Few-Shot Examples (Optional Style References)
              </label>
              <button
                type="button"
                onClick={handleAddExample}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Example</span>
              </button>
            </div>

            {examples.map((ex, i) => (
              <div
                key={i}
                className="p-3 mb-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
                  <span>Example {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExample(i)}
                    className="text-rose-500 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={ex.input}
                  onChange={(e) => handleUpdateExample(i, "input", e.target.value)}
                  placeholder="Example User Situation..."
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
                <textarea
                  value={ex.output}
                  onChange={(e) => handleUpdateExample(i, "output", e.target.value)}
                  rows={3}
                  placeholder="Expected Fiverr Message Output..."
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>
            ))}
          </div>

          {/* Row 7: Output Format & Enabled Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as "plain_text" | "markdown")}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="plain_text">Plain Text (Natural spacing)</option>
                <option value="markdown">Markdown (Bullets & Bold support)</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Workflow Enabled (Visible in Generator)</span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Message Type"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
