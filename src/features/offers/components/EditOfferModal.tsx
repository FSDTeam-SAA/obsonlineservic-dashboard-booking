"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Search, Tag, Calendar, Percent, Euro, Trees, Home, Globe } from "lucide-react";
import { Offer, OfferScope, OfferType, OfferStatus } from "../types/offers.types";
import { updateOffer } from "../api/offers.api";
import { fetchAdminHolidayParks } from "@/features/holiday-parks/api/holiday-parks.api";
import { fetchAdminProperties } from "@/features/properties/api/properties.api";

interface EditOfferModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOffer: Offer) => void;
}

export function EditOfferModal({
  offer,
  isOpen,
  onClose,
  onSuccess,
}: Readonly<EditOfferModalProps>) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [offerName, setOfferName] = useState("");
  const [offerCode, setOfferCode] = useState("");
  const [offerType, setOfferType] = useState<OfferType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [fixedDiscount, setFixedDiscount] = useState<number>(0);
  const [minBookingAmount, setMinBookingAmount] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(1000);
  const [maxUsesPerGuest, setMaxUsesPerGuest] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<OfferScope>("entire_platform");
  const [status, setStatus] = useState<OfferStatus>("Active");

  // Dates
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  // Targets
  const [parksList, setParksList] = useState<{ id: string; name: string }[]>([]);
  const [propertiesList, setPropertiesList] = useState<{ id: string; title: string }[]>([]);
  const [selectedParkIds, setSelectedParkIds] = useState<string[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState("");

  // Populate state when offer changes or modal opens
  useEffect(() => {
    if (offer) {
      setOfferName(offer.offerName || "");
      setOfferCode(offer.offerCode || "");
      setOfferType(offer.offerType || "percentage");
      setDiscountValue(offer.discountValue || "");
      setDiscountPercentage(offer.discountPercentage ?? 0);
      setFixedDiscount(offer.fixedDiscount ?? 0);
      setMinBookingAmount(offer.minBookingAmount ?? 0);
      setMaxDiscount(offer.maxDiscount ?? 0);
      setMaxUses(offer.maxUses ?? 1000);
      setMaxUsesPerGuest(offer.maxUsesPerGuest ?? 1);
      setDescription(offer.description || "");
      setScope(offer.scope || "entire_platform");
      setStatus(offer.status || "Active");

      if (offer.validFrom) {
        setValidFrom(new Date(offer.validFrom).toISOString().split("T")[0]);
      }
      if (offer.validUntil) {
        setValidUntil(new Date(offer.validUntil).toISOString().split("T")[0]);
      }

      // Existing park IDs
      if (offer.applicableParks) {
        const parkIds = offer.applicableParks.map((p) =>
          typeof p === "object" ? p._id : p
        );
        setSelectedParkIds(parkIds);
      } else {
        setSelectedParkIds([]);
      }

      // Existing property IDs
      if (offer.applicableProperties) {
        const propIds = offer.applicableProperties.map((pr) =>
          typeof pr === "object" ? pr._id : pr
        );
        setSelectedPropertyIds(propIds);
      } else {
        setSelectedPropertyIds([]);
      }
    }
  }, [offer]);

  // Load choices
  useEffect(() => {
    if (!isOpen) return;

    async function loadTargets() {
      try {
        const [parksData, propsData] = await Promise.all([
          fetchAdminHolidayParks({ page: 1, limit: 100 }).catch(() => ({ items: [] })),
          fetchAdminProperties({ page: 1, limit: 100 }).catch(() => ({ items: [] })),
        ]);

        const parksItems = (parksData as any)?.data?.items || (parksData as any)?.items;
        if (parksItems) {
          setParksList(
            parksItems.map((p: any) => ({
              id: p._id || p.id,
              name: p.title || p.name,
            }))
          );
        }

        if (propsData?.items) {
          setPropertiesList(
            propsData.items.map((pr: any) => ({
              id: pr._id || pr.id,
              title: pr.title,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load target choices:", err);
      }
    }

    loadTargets();
  }, [isOpen]);

  if (!isOpen || !offer) return null;

  const handleDiscountValueChange = (val: string) => {
    setDiscountValue(val);
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      if (offerType === "percentage") {
        setDiscountPercentage(num);
      } else {
        setFixedDiscount(num);
      }
    }
  };

  const handleTogglePark = (id: string) => {
    setSelectedParkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerName.trim()) {
      setErrorMessage("Offer name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const updated = await updateOffer(offer._id, {
        offerName: offerName.trim(),
        offerCode: offerCode.trim().toUpperCase() || undefined,
        offerType,
        discountValue,
        discountPercentage: offerType === "percentage" ? discountPercentage : 0,
        fixedDiscount: offerType === "fixed" ? fixedDiscount : 0,
        minBookingAmount: Number(minBookingAmount) || 0,
        maxDiscount: Number(maxDiscount) || 0,
        maxUses: Number(maxUses) || 0,
        maxUsesPerGuest: Number(maxUsesPerGuest) || 1,
        description: description.trim(),
        scope,
        applicableParks: scope === "holiday_parks" ? selectedParkIds : [],
        applicableProperties: scope === "properties" ? selectedPropertyIds : [],
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        status,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error("Failed to update offer:", err);
      setErrorMessage(
        err?.response?.data?.message || "Failed to update promotional offer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParks = parksList.filter((p) =>
    p.name.toLowerCase().includes(targetSearch.toLowerCase())
  );

  const filteredProperties = propertiesList.filter((pr) =>
    pr.title.toLowerCase().includes(targetSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Edit Offer Campaign</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Modify discount parameters, dates, or targeted scope for "{offer.offerName}"
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
          
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Offer Name *</span>
              <input
                type="text"
                required
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>

            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Promo Code (Optional)</span>
              <div className="relative">
                <Tag size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER2026"
                  className="w-full h-10 pl-8 pr-3 border border-slate-200 rounded-lg text-slate-900 font-mono uppercase tracking-wider outline-none focus:border-[#3b338c] bg-white"
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Offer Type</span>
              <select
                value={offerType}
                onChange={(e) => {
                  const t = e.target.value as OfferType;
                  setOfferType(t);
                  setDiscountValue(t === "percentage" ? `${discountPercentage || 15}%` : `€${fixedDiscount || 50}`);
                }}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none cursor-pointer focus:border-[#3b338c] bg-white"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed">Fixed Amount Discount (€)</option>
              </select>
            </label>

            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OfferStatus)}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none cursor-pointer focus:border-[#3b338c] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Expired">Expired</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>

          {/* Discount Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Discount Display Value *</span>
              <input
                type="text"
                required
                value={discountValue}
                onChange={(e) => handleDiscountValueChange(e.target.value)}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>

            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Min Booking (€)</span>
              <input
                type="number"
                min="0"
                value={minBookingAmount}
                onChange={(e) => setMinBookingAmount(Number(e.target.value))}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>

            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Max Discount (€)</span>
              <input
                type="number"
                min="0"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                placeholder="0 (Unlimited)"
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Max Total Uses</span>
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>

            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Max Uses Per Guest</span>
              <input
                type="number"
                min="1"
                value={maxUsesPerGuest}
                onChange={(e) => setMaxUsesPerGuest(Number(e.target.value))}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>
          </div>

          {/* Target Scope */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-800 block">Target Scope</span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="edit-scope"
                  value="entire_platform"
                  checked={scope === "entire_platform"}
                  onChange={() => setScope("entire_platform")}
                  className="accent-[#3b338c]"
                />
                Entire Platform
              </label>
              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="edit-scope"
                  value="holiday_parks"
                  checked={scope === "holiday_parks"}
                  onChange={() => setScope("holiday_parks")}
                  className="accent-[#3b338c]"
                />
                Specific Holiday Parks
              </label>
              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="edit-scope"
                  value="properties"
                  checked={scope === "properties"}
                  onChange={() => setScope("properties")}
                  className="accent-[#3b338c]"
                />
                Specific Properties
              </label>
            </div>

            {scope !== "entire_platform" && (
              <div className="space-y-2 pt-2">
                <div className="flex h-9 px-3 border border-slate-200 rounded-lg items-center gap-2 text-slate-400 bg-white">
                  <Search size={14} />
                  <input
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    placeholder={`Search ${scope === "holiday_parks" ? "holiday parks" : "properties"}...`}
                    className="w-full text-xs text-slate-800 outline-none bg-transparent"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50">
                  {scope === "holiday_parks" ? (
                    filteredParks.length ? (
                      filteredParks.map((park) => (
                        <label
                          key={park.id}
                          className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer p-1.5 hover:bg-white rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedParkIds.includes(park.id)}
                            onChange={() => handleTogglePark(park.id)}
                            className="accent-[#3b338c]"
                          />
                          <span className="truncate">{park.name}</span>
                        </label>
                      ))
                    ) : (
                      <span className="text-slate-400 p-2">No holiday parks match.</span>
                    )
                  ) : filteredProperties.length ? (
                    filteredProperties.map((prop) => (
                      <label
                        key={prop.id}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer p-1.5 hover:bg-white rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPropertyIds.includes(prop.id)}
                          onChange={() => handleToggleProperty(prop.id)}
                          className="accent-[#3b338c]"
                        />
                        <span className="truncate">{prop.title}</span>
                      </label>
                    ))
                  ) : (
                    <span className="text-slate-400 p-2">No properties match.</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Valid From *</span>
              <input
                type="date"
                required
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>

            <label className="grid gap-1.5 font-semibold text-slate-700">
              <span>Valid Until *</span>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white"
              />
            </label>
          </div>

          {/* Description */}
          <label className="grid gap-1.5 font-semibold text-slate-700 pt-2 border-t border-slate-100">
            <span>Description & Terms</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="p-3 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-[#3b338c] bg-white resize-y"
            />
          </label>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#3b338c] hover:bg-[#2d276f] text-white font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Offer"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
