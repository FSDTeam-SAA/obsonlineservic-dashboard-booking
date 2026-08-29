"use client";

import React from "react";
import { ImageUploadBox } from "./ImageUploadBox";

export interface GallerySlot {
  key: string;
  label: string;
  hint?: string;
}

export const PROPERTY_GALLERY_SLOTS: GallerySlot[] = [
  { key: "main",  label: "Main Featured Image",  hint: "Primary photo shown in listings (recommended 1200×800)" },
  { key: "side1", label: "Side Image 1",          hint: "Gallery detail shot 1 (recommended 600×400)" },
  { key: "side2", label: "Side Image 2",          hint: "Gallery detail shot 2 (recommended 600×400)" },
  { key: "side3", label: "Side Image 3",          hint: "Gallery detail shot 3 (recommended 600×400)" },
];

export type GalleryValues = {
  main: string;
  side1: string;
  side2: string;
  side3: string;
};

interface MultipleImageUploadBoxProps {
  /** Current gallery URL values */
  values: GalleryValues;
  /** Called when any slot URL changes */
  onChange: (key: keyof GalleryValues, url: string) => void;
  /** Disable all slots (e.g. during form submission) */
  disabled?: boolean;
}

/**
 * 4-slot property gallery upload grid.
 * Renders an ImageUploadBox for each gallery slot (main + 3 side images).
 * Each slot supports drag-and-drop, file picker, preview, and URL paste.
 */
export function MultipleImageUploadBox({
  values,
  onChange,
  disabled = false,
}: MultipleImageUploadBoxProps) {
  return (
    <div className="grid gap-4">
      {/* Main image — full width */}
      <ImageUploadBox
        label={PROPERTY_GALLERY_SLOTS[0].label}
        hint={PROPERTY_GALLERY_SLOTS[0].hint}
        value={values.main}
        onChange={(url) => onChange("main", url)}
        disabled={disabled}
      />

      {/* 3 side images — 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PROPERTY_GALLERY_SLOTS.slice(1).map((slot) => (
          <ImageUploadBox
            key={slot.key}
            label={slot.label}
            hint={slot.hint}
            value={values[slot.key as keyof GalleryValues]}
            onChange={(url) => onChange(slot.key as keyof GalleryValues, url)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
