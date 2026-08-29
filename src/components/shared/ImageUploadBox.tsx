"use client";

import React, { useRef, useState, useCallback, DragEvent } from "react";
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploadBoxProps {
  /** Field label displayed above the upload zone */
  label: string;
  /** Current image URL (controlled) */
  value: string;
  /** Called with new URL when upload completes or URL is pasted */
  onChange: (url: string) => void;
  /** Optional placeholder hint text */
  hint?: string;
  /** Optional CSS class for the container */
  className?: string;
  /** Disable the upload zone (e.g. during form submission) */
  disabled?: boolean;
}

/**
 * Premium image upload widget with:
 * - Drag-and-drop support
 * - Click-to-browse file picker
 * - Live image preview with thumbnail
 * - Upload progress spinner overlay
 * - Clear/replace button
 * - Client-side type + size validation
 * - URL paste fallback input
 */
export function ImageUploadBox({
  label,
  value,
  onChange,
  hint,
  className = "",
  disabled = false,
}: ImageUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploading, error, upload, clearError } = useImageUpload();

  const handleFile = useCallback(
    async (file: File) => {
      const url = await upload(file);
      if (url) onChange(url);
    },
    [upload, onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected after clear
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange("");
    clearError();
  };

  const handleZoneClick = () => {
    if (!disabled && !uploading) fileInputRef.current?.click();
  };

  const isDisabled = disabled || uploading;

  return (
    <div className={`grid gap-2 ${className}`}>
      {/* Label */}
      <span className="text-sm font-semibold text-slate-800">{label}</span>

      {/* Preview or Drop Zone */}
      {value ? (
        // ── Live Preview State ──────────────────────────────────────────────
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt={label}
            className="w-full h-44 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleZoneClick}
              disabled={isDisabled}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/90 text-slate-800 rounded-lg text-xs font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              <Upload size={14} />
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isDisabled}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600/90 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <X size={14} />
              Remove
            </button>
          </div>

          {/* Upload loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 size={28} className="animate-spin" />
                <span className="text-xs font-medium">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ── Drop Zone State ─────────────────────────────────────────────────
        <div
          onClick={handleZoneClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative h-44 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
            grid place-items-center
            ${isDragging
              ? "border-[#3b338c] bg-violet-50 scale-[1.01]"
              : "border-slate-300 bg-slate-50 hover:border-[#3b338c] hover:bg-violet-50/40"
            }
            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[#3b338c]">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-xs font-semibold">Uploading image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 select-none pointer-events-none">
              <div className="p-3 bg-slate-100 rounded-full">
                <ImageIcon size={24} className="text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  {isDragging ? "Drop to upload" : "Drop image or click to browse"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {hint ?? "JPEG, PNG, WebP, GIF — up to 5 MB"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* URL paste fallback */}
      <input
        type="url"
        value={value}
        onChange={(e) => {
          clearError();
          onChange(e.target.value);
        }}
        placeholder="Or paste an image URL…"
        disabled={isDisabled}
        className="h-10 px-3 border border-slate-200 rounded-lg text-slate-700 text-xs outline-none focus:border-[#3b338c] transition-colors placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileInputChange}
        disabled={isDisabled}
      />
    </div>
  );
}
