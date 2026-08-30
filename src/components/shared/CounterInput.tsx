"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface CounterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

export function CounterInput({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit = "",
}: CounterInputProps) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[11px] font-semibold text-slate-800 tracking-tight block">
        {label}
      </label>
      <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50/50 p-1.5 h-11">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-bold text-slate-800 px-3 truncate">
          {value} {unit}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
