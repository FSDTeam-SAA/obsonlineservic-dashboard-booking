"use client";

import React, { useState } from "react";
import {
  X,
  Tag,
  Calendar,
  Sparkles,
  Globe,
  Trees,
  Home,
  Check,
  Copy,
  Clock,
  Edit,
  Trash2,
  Users,
  ShieldCheck,
  Percent,
  Euro,
  Info,
} from "lucide-react";
import { Offer } from "../types/offers.types";

interface OfferDetailsModalProps {
  offer: Offer | null;
  onClose: () => void;
  onEdit: (offer: Offer) => void;
  onDelete: (offer: Offer) => void;
}

export function OfferDetailsModal({
  offer,
  onClose,
  onEdit,
  onDelete,
}: Readonly<OfferDetailsModalProps>) {
  const [copied, setCopied] = useState(false);

  if (!offer) return null;

  const handleCopyCode = () => {
    if (!offer.offerCode) return;
    navigator.clipboard.writeText(offer.offerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const until = new Date(offer.validUntil).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((until - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: "Expired", color: "bg-rose-50 text-rose-700 border-rose-200" };
    if (diff === 0) return { text: "Expires Today", color: "bg-amber-50 text-amber-700 border-amber-200" };
    return { text: `${diff} days remaining`, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  const daysInfo = getDaysRemaining();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
      case "Expired":
        return "bg-rose-500/10 text-rose-700 border-rose-200";
      case "Draft":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      case "Inactive":
      default:
        return "bg-slate-500/10 text-slate-700 border-slate-200";
    }
  };

  const maxUses = offer.maxUses || 0;
  const usedCount = offer.usedCount || 0;
  const usagePercentage = maxUses > 0 ? Math.min(100, Math.round((usedCount / maxUses) * 100)) : 0;

  // Extract park names/objects
  const renderParks = () => {
    if (offer.scope === "entire_platform") return null;

    if (offer.applicableParks && offer.applicableParks.length > 0) {
      return offer.applicableParks.map((p, idx) => {
        const name = typeof p === "object" ? p.name || p.title || p._id : p;
        return (
          <span
            key={typeof p === "object" ? p._id : idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
          >
            <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {name}
          </span>
        );
      });
    }

    if (offer.applicableParkNames && offer.applicableParkNames.length > 0) {
      return offer.applicableParkNames.map((name, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
        >
          <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {name}
        </span>
      ));
    }

    return (
      <span className="text-xs text-slate-500 italic">No specific parks listed</span>
    );
  };

  // Extract property titles/objects
  const renderProperties = () => {
    if (offer.scope !== "properties") return null;

    if (offer.applicableProperties && offer.applicableProperties.length > 0) {
      return offer.applicableProperties.map((pr, idx) => {
        const title = typeof pr === "object" ? pr.title || pr._id : pr;
        return (
          <span
            key={typeof pr === "object" ? pr._id : idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold"
          >
            <Home className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            {title}
          </span>
        );
      });
    }

    return (
      <span className="text-xs text-slate-500 italic">No specific properties listed</span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-[#2d276f] to-[#3b338c] text-white flex items-start justify-between relative">
          <div className="space-y-2 pr-6">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(offer.status)}`}>
                {offer.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 uppercase tracking-wider flex items-center gap-1">
                {offer.offerType === "percentage" ? <Percent size={12} /> : <Euro size={12} />}
                {offer.offerType} Discount
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${daysInfo.color}`}>
                {daysInfo.text}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">{offer.offerName}</h2>

            {/* Promo Code Box */}
            {offer.offerCode ? (
              <div className="inline-flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-300 font-medium">Promo Code:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="group flex items-center gap-2 px-3 py-1 bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/30 rounded-lg text-xs font-mono font-bold tracking-widest transition-all cursor-pointer"
                  title="Click to copy promo code"
                >
                  <Tag size={13} className="text-amber-300" />
                  <span>{offer.offerCode}</span>
                  {copied ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} className="text-slate-300 group-hover:text-white transition-colors" />
                  )}
                </button>
                {copied && (
                  <span className="text-[11px] font-semibold text-emerald-400 animate-in fade-in">
                    Copied!
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">Automatic Discount (No code required)</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {/* Discount Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Discount Value</span>
              <p className="text-lg font-black text-[#3b338c]">
                {offer.discountValue || (offer.offerType === "percentage" ? `${offer.discountPercentage}%` : `€${offer.fixedDiscount}`)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Min Booking</span>
              <p className="text-sm font-extrabold text-slate-800">
                {offer.minBookingAmount ? `€${offer.minBookingAmount}` : "None"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Max Discount</span>
              <p className="text-sm font-extrabold text-slate-800">
                {offer.maxDiscount ? `€${offer.maxDiscount}` : "Unlimited"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Per Guest Limit</span>
              <p className="text-sm font-extrabold text-slate-800">
                {offer.maxUsesPerGuest ? `${offer.maxUsesPerGuest} time(s)` : "1 time"}
              </p>
            </div>
          </div>

          {/* Usage Capacity Progress Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Users size={14} className="text-[#3b338c]" />
                Campaign Capacity & Redemption Status
              </span>
              <span className="font-semibold text-slate-600">
                {usedCount} / {maxUses > 0 ? maxUses : "Unlimited"} used ({maxUses > 0 ? `${usagePercentage}%` : "No limit"})
              </span>
            </div>
            {maxUses > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    usagePercentage > 90 ? "bg-rose-500" : usagePercentage > 60 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            )}
          </div>

          {/* Scope & Applicable Items Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#3b338c]" />
              Applicable Scope & Destinations
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Scope Level:</span>
                {offer.scope === "entire_platform" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold">
                    <Globe size={13} />
                    Entire Platform (All Parks & Properties)
                  </span>
                )}
                {offer.scope === "holiday_parks" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <Trees size={13} />
                    Specific Holiday Parks
                  </span>
                )}
                {offer.scope === "properties" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold">
                    <Home size={13} />
                    Specific Accommodation Properties
                  </span>
                )}
              </div>

              {/* Render Selected Parks */}
              {offer.scope === "holiday_parks" && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Selected Holiday Parks:</span>
                  <div className="flex flex-wrap gap-2">
                    {renderParks()}
                  </div>
                </div>
              )}

              {/* Render Selected Properties */}
              {offer.scope === "properties" && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Selected Accommodation Properties:</span>
                  <div className="flex flex-wrap gap-2">
                    {renderProperties()}
                  </div>
                </div>
              )}

              {offer.scope === "entire_platform" && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  This offer is globally applicable to all current and future holiday park locations and individual property listings across the platform.
                </p>
              )}
            </div>
          </div>

          {/* Validity Period Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar size={14} className="text-[#3b338c]" />
              Validity Window
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Valid From</span>
                  <span className="text-sm font-bold text-slate-900">{formatDate(offer.validFrom)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Valid Until</span>
                  <span className="text-sm font-bold text-slate-900">{formatDate(offer.validUntil)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {offer.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info size={14} className="text-[#3b338c]" />
                Terms & Campaign Description
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-normal">
                {offer.description}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDelete(offer)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            Delete Offer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(offer)}
              className="px-4 py-2 bg-[#3b338c] hover:bg-[#2d276f] text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Edit size={14} />
              Edit Offer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
