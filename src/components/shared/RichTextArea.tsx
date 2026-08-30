"use client";

import React from "react";
import { Bold, Italic, List, Link as LinkIcon } from "lucide-react";

interface RichTextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export function RichTextArea({
  label,
  value,
  onChange,
  placeholder = "Describe the atmosphere, surroundings and experience...",
  rows = 4,
}: RichTextAreaProps) {
  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[11px] font-semibold text-slate-800 tracking-tight block">
        {label}
      </label>
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-slate-600">
          <button
            type="button"
            className="p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-700 font-bold text-xs"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-700 italic text-xs"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            className="p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-700 text-xs"
            title="Unordered List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-700 text-xs"
            title="Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Area Input */}
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-y min-h-[100px]"
        />
      </div>
    </div>
  );
}
