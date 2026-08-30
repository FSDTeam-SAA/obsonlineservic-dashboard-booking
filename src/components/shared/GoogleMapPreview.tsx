"use client";

import React, { useState } from "react";
import { MapPin, Navigation, ExternalLink, Compass, Layers } from "lucide-react";

interface GoogleMapPreviewProps {
  locationName?: string;
  city?: string;
  country?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  height?: string;
  zoom?: number;
  showDetailsBar?: boolean;
}

export function GoogleMapPreview({
  locationName,
  city,
  country,
  formattedAddress,
  latitude,
  longitude,
  height = "h-[280px]",
  zoom = 14,
  showDetailsBar = true,
}: GoogleMapPreviewProps) {
  const [mapType, setMapType] = useState<"m" | "k">("m"); // m = roadmap, k = satellite

  const searchAddress = [formattedAddress, locationName, city, country].filter(Boolean).join(", ");
  const queryLabel = searchAddress || "Veluwe, Netherlands";

  const hasCoords = typeof latitude === "number" && typeof longitude === "number" && !isNaN(latitude) && !isNaN(longitude);

  const embedSrc = hasCoords
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(queryLabel)}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  const externalMapUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryLabel)}`;

  return (
    <div className="w-full space-y-2 font-sans">
      <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 group`}>
        {/* Real Interactive Google Maps Embed */}
        <iframe
          title={`Google Map - ${queryLabel}`}
          src={embedSrc}
          className="w-full h-full border-0 transition-opacity duration-300"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Top Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Location Badge */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-2 text-xs font-bold text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-[#3b338c] shrink-0" />
            <span className="truncate max-w-[240px] sm:max-w-md">{queryLabel}</span>
          </div>

          {/* Map Controls */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80">
            <button
              type="button"
              onClick={() => setMapType((prev) => (prev === "m" ? "k" : "m"))}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                mapType === "k"
                  ? "bg-[#3b338c] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Toggle Map / Satellite View"
            >
              <Layers className="w-3 h-3 inline mr-1" />
              <span>{mapType === "k" ? "Satellite" : "Map"}</span>
            </button>

            <a
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 hover:text-[#3b338c] hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              title="Open in Google Maps"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {showDetailsBar && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#3b338c]" />
            <span>
              {hasCoords
                ? `Coordinates: ${latitude?.toFixed(4)}° N, ${longitude?.toFixed(4)}° E`
                : "Geocoded from search address"}
            </span>
          </div>
          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3b338c] hover:underline font-semibold flex items-center gap-1"
          >
            Open full interactive directions
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
