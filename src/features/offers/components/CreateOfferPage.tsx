"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Loader2, Search, ArrowLeft, Tag } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { createOffer } from "../api/offers.api";
import { OfferScope, OfferType, OfferStatus } from "../types/offers.types";
import { fetchAdminHolidayParks } from "@/features/holiday-parks/api/holiday-parks.api";
import { fetchAdminProperties } from "@/features/properties/api/properties.api";

export function CreateOfferPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [offerName, setOfferName] = useState("");
  const [offerCode, setOfferCode] = useState("");
  const [offerType, setOfferType] = useState<OfferType>("percentage");
  const [discountValue, setDiscountValue] = useState("15%");
  const [discountPercentage, setDiscountPercentage] = useState<number>(15);
  const [fixedDiscount, setFixedDiscount] = useState<number>(0);
  const [minBookingAmount, setMinBookingAmount] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(1000);
  const [maxUsesPerGuest, setMaxUsesPerGuest] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<OfferScope>("entire_platform");
  const [status, setStatus] = useState<OfferStatus>("Active");

  // Dates
  const [validFrom, setValidFrom] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  });

  // Dynamic selection for Holiday Parks & Properties
  const [parksList, setParksList] = useState<{ id: string; name: string }[]>([]);
  const [propertiesList, setPropertiesList] = useState<{ id: string; title: string }[]>([]);
  const [selectedParkIds, setSelectedParkIds] = useState<string[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState("");

  useEffect(() => {
    async function loadTargets() {
      try {
        const [parksData, propsData] = await Promise.all([
          fetchAdminHolidayParks({ page: 1, limit: 50 }).catch(() => ({ items: [] })),
          fetchAdminProperties({ page: 1, limit: 50 }).catch(() => ({ items: [] })),
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
  }, []);

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

      await createOffer({
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

      router.push("/dashboard/offers");
    } catch (err: any) {
      console.error("Failed to create offer:", err);
      setErrorMessage(err?.response?.data?.message || "Failed to create promotional offer.");
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
    <DashboardShell
      active="Offers"
      title="Create New Offer"
      subtitle="Design a promotional discount or campaign code for guests."
    >
      <main className="p-5 md:p-8 font-sans max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard/offers")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Offers List
        </button>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <OfferSection title="1. Offer Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Offer Name *</span>
                <input
                  type="text"
                  required
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  placeholder="e.g. Early Summer Escape"
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Promo Code (Optional)</span>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER2026"
                    className="w-full h-11 pl-9 pr-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c] font-mono tracking-wider"
                  />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Offer Type</span>
                <select
                  value={offerType}
                  onChange={(e) => {
                    const t = e.target.value as OfferType;
                    setOfferType(t);
                    setDiscountValue(t === "percentage" ? "15%" : "€50");
                  }}
                  className="h-11 px-4 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none cursor-pointer focus:border-[#3b338c]"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Amount Discount (€)</option>
                </select>
              </label>

              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Initial Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OfferStatus)}
                  className="h-11 px-4 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none cursor-pointer focus:border-[#3b338c]"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-slate-800 text-xs font-semibold">
              <span>Offer Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the promotion terms and features..."
                className="w-full p-3.5 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white placeholder-slate-400 focus:border-[#3b338c] resize-y"
              />
            </label>
          </OfferSection>

          {/* Section 2: Discount & Limits */}
          <OfferSection title="2. Discount & Limits">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Discount Value *</span>
                <input
                  type="text"
                  required
                  value={discountValue}
                  onChange={(e) => handleDiscountValueChange(e.target.value)}
                  placeholder={offerType === "percentage" ? "15%" : "€50"}
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Min Booking Amount (€)</span>
                <input
                  type="number"
                  min="0"
                  value={minBookingAmount}
                  onChange={(e) => setMinBookingAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Max Discount (€)</span>
                <input
                  type="number"
                  min="0"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                  placeholder="0 (Unlimited)"
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Maximum Uses</span>
                <input
                  type="number"
                  min="0"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Max Uses Per Guest</span>
                <input
                  type="number"
                  min="1"
                  value={maxUsesPerGuest}
                  onChange={(e) => setMaxUsesPerGuest(Number(e.target.value))}
                  placeholder="1"
                  className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>
            </div>
          </OfferSection>

          {/* Section 3: Scope Applicability */}
          <OfferSection title="3. Target Scope">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="entire_platform"
                  checked={scope === "entire_platform"}
                  onChange={() => setScope("entire_platform")}
                  className="accent-[#3b338c]"
                />
                Entire Platform
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="holiday_parks"
                  checked={scope === "holiday_parks"}
                  onChange={() => setScope("holiday_parks")}
                  className="accent-[#3b338c]"
                />
                Specific Holiday Parks
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="properties"
                  checked={scope === "properties"}
                  onChange={() => setScope("properties")}
                  className="accent-[#3b338c]"
                />
                Specific Properties
              </label>
            </div>

            {scope !== "entire_platform" && (
              <div className="space-y-3 pt-2">
                <div className="flex h-10 px-3 border border-slate-200 rounded-lg items-center gap-2 text-slate-400 bg-white">
                  <Search size={16} />
                  <input
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    placeholder={`Search ${scope === "holiday_parks" ? "holiday parks" : "properties"}...`}
                    className="w-full text-xs text-slate-800 outline-none bg-transparent"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50">
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
                          <span>{park.name}</span>
                        </label>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 p-2">No holiday parks found.</span>
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
                        <span>{prop.title}</span>
                      </label>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 p-2">No properties found.</span>
                  )}
                </div>
              </div>
            )}
          </OfferSection>

          {/* Section 4: Validity Dates */}
          <OfferSection title="4. Validity Period">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>Start Date *</span>
                <input
                  type="date"
                  required
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-2 text-slate-800 text-xs font-semibold">
                <span>End Date *</span>
                <input
                  type="date"
                  required
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-11 px-4 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none bg-white focus:border-[#3b338c]"
                />
              </label>
            </div>
          </OfferSection>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/offers")}
              className="h-11 px-6 rounded-lg font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 rounded-lg font-semibold bg-[#3b338c] hover:bg-[#2d276f] text-white transition-colors text-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Offer...
                </>
              ) : (
                "Publish Offer"
              )}
            </button>
          </div>
        </form>
      </main>
    </DashboardShell>
  );
}

function OfferSection({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="p-6 border border-slate-200 rounded-xl bg-white shadow-xs space-y-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
