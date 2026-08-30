"use client";

import React from "react";
import { MapPin, Navigation } from "lucide-react";

interface GoogleMapPreviewProps {
  locationName?: string;
  city?: string;
  country?: string;
}

export function GoogleMapPreview({ locationName, city, country }: GoogleMapPreviewProps) {
  const displayLabel = [locationName, city, country].filter(Boolean).join(", ") || "Utrecht, Netherlands";

  return (
    <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 group">
      {/* Map Graphic Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200')`,
        }}
      />

      {/* Overlay styling for map vector look */}
      <div className="absolute inset-0 bg-slate-900/10 backdrop-contrast-[1.05]" />

      {/* Map Pin Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#30277a] border-2 border-white shadow-xl flex items-center justify-center animate-bounce">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 w-4 h-1.5 bg-black/40 rounded-full blur-[1px]" />
        </div>
        <div className="mt-2 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200/80 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-[#30277a]" />
          <span>{displayLabel}</span>
        </div>
      </div>
    </div>
  );
}
