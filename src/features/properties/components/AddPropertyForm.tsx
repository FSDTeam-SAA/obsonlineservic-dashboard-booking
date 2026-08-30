"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { createProperty } from "../api/properties.api";
import { CreatePropertyDto, PropertyCategory, PropertyStatus } from "../types/properties.types";
import { api } from "@/lib/api";
import { MultipleImageUploadBox, GalleryValues } from "@/components/shared/MultipleImageUploadBox";

interface AddPropertyFormProps {
  parkId?: string;
}

export function AddPropertyForm({ parkId }: AddPropertyFormProps) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("FEATURED LODGE");
  const [category, setCategory] = useState<PropertyCategory>("Wellness Villas");
  const [holidayPark, setHolidayPark] = useState(parkId || "");
  const [selectedParkDetails, setSelectedParkDetails] = useState<any>(null);
  const [holidayParksList, setHolidayParksList] = useState<{ _id: string; title: string; name?: string; location?: any; badgeLocation?: string }[]>([]);
  const [pricePerNight, setPricePerNight] = useState<number>(129);
  const [guests, setGuests] = useState<number>(4);
  const [beds, setBeds] = useState<number>(2);
  const [baths, setBaths] = useState<number>(2);
  const [size, setSize] = useState("240 m²");
  const [petsAllowed, setPetsAllowed] = useState(true);
  const [cleaningFee, setCleaningFee] = useState<number>(80);
  const [taxes, setTaxes] = useState<number>(45);
  const [description, setDescription] = useState("");

  // Gallery
  const [gallery, setGallery] = useState<GalleryValues>({
    main:  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200",
    side1: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600",
    side2: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
    side3: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600",
  });

  const handleGalleryChange = (key: keyof GalleryValues, url: string) => {
    setGallery((prev) => ({ ...prev, [key]: url }));
  };

  const [status, setStatus] = useState<PropertyStatus>("Active");
  const [isPopular, setIsPopular] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadHolidayParks() {
      try {
        const res = await api.get("/holiday-parks");
        let items = [];
        if (res.data && res.data.items) {
          items = res.data.items;
        } else if (Array.isArray(res.data)) {
          items = res.data;
        }
        setHolidayParksList(items);

        if (parkId) {
          const matched = items.find((p: any) => p._id === parkId);
          if (matched) setSelectedParkDetails(matched);
        }
      } catch (err) {
        // Fallback silently
      }
    }
    loadHolidayParks();
  }, [parkId]);

  useEffect(() => {
    if (holidayPark && holidayParksList.length > 0) {
      const matched = holidayParksList.find((p) => p._id === holidayPark);
      if (matched) setSelectedParkDetails(matched);
    }
  }, [holidayPark, holidayParksList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Property Title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreatePropertyDto = {
        title: title.trim(),
        badge: badge.trim(),
        category,
        holidayPark: holidayPark || undefined,
        description: description.trim(),
        pricePerNight: Number(pricePerNight),
        guests: Number(guests),
        beds: Number(beds),
        baths: Number(baths),
        size: size.trim(),
        petsAllowed,
        cleaningFee: Number(cleaningFee),
        taxes: Number(taxes),
        gallery: {
          main:  gallery.main.trim(),
          side1: gallery.side1.trim(),
          side2: gallery.side2.trim(),
          side3: gallery.side3.trim(),
        },
        status,
        isPopular,
      };

      await createProperty(payload);
      if (holidayPark) {
        router.push(`/dashboard/holiday-parks/${holidayPark}/properties`);
      } else {
        router.push("/dashboard/holiday-parks");
      }
    } catch (err: any) {
      console.error("Failed to create property:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref = holidayPark ? `/dashboard/holiday-parks/${holidayPark}/properties` : "/dashboard/holiday-parks";

  return (
    <DashboardShell
      active="Holiday Parks"
      title="Add New Property"
      subtitle={selectedParkDetails ? `Adding property under ${selectedParkDetails.title || selectedParkDetails.name}` : "Create a luxury lodge, villa or cabin listing."}
    >
      <main className="p-5 md:p-8 font-sans grid gap-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3b338c] transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Properties List
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Section 1: Basic Information */}
          <section className="p-6 border border-slate-200 rounded-lg bg-white shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Basic Property Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Property Title *</span>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Luxury Lake Villa"
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Badge / Tag</span>
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. FEATURED LODGE"
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                >
                  <option value="Wellness Villas">Wellness Villas</option>
                  <option value="Lakefront">Lakefront</option>
                  <option value="Cabins & Lodges">Cabins & Lodges</option>
                </select>
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Parent Holiday Park *</span>
                <select
                  value={holidayPark}
                  disabled={Boolean(parkId)}
                  onChange={(e) => setHolidayPark(e.target.value)}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c] bg-slate-50 disabled:opacity-80 font-bold text-[#3b338c]"
                >
                  <option value="">-- Select Holiday Park --</option>
                  {holidayParksList.map((hp) => (
                    <option key={hp._id} value={hp._id}>
                      {hp.title || hp.name || "Holiday Park"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Geographic Location Inheritance Banner */}
            <div className="p-3.5 bg-violet-50/70 border border-violet-100 rounded-lg flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#3b338c]">📍 Geographic Location:</span>
                <span>
                  {selectedParkDetails?.location?.city
                    ? `${selectedParkDetails.location.city}, ${selectedParkDetails.location.country || ""}`
                    : selectedParkDetails?.badgeLocation || "Inherited automatically from parent Holiday Park"}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                Auto-Inherited
              </span>
            </div>

            <label className="grid gap-1.5 font-semibold text-slate-700 text-xs">
              <span>Full Description</span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the architectural design, surroundings, and experience..."
                className="p-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
              />
            </label>
          </section>

          {/* Section 2: Pricing & Capacity */}
          <section className="p-6 border border-slate-200 rounded-lg bg-white shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Pricing & Capacity Specifications</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Price Per Night (€) *</span>
                <input
                  type="number"
                  required
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(Number(e.target.value))}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Max Guests</span>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Beds</span>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Baths</span>
                <input
                  type="number"
                  value={baths}
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Property Size</span>
                <input
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 240 m²"
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Cleaning Fee (€)</span>
                <input
                  type="number"
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(Number(e.target.value))}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-700">
                <span>Taxes (€)</span>
                <input
                  type="number"
                  value={taxes}
                  onChange={(e) => setTaxes(Number(e.target.value))}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                />
              </label>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="pets-allowed"
                  checked={petsAllowed}
                  onChange={(e) => setPetsAllowed(e.target.checked)}
                  className="size-4 rounded accent-[#3b338c]"
                />
                <label htmlFor="pets-allowed" className="font-semibold text-slate-700 cursor-pointer">
                  Pets Allowed
                </label>
              </div>
            </div>
          </section>

          {/* Section 3: Gallery Media */}
          <section className="p-6 border border-slate-200 rounded-lg bg-white shadow-2xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gallery Media</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload or paste URLs for the main photo and up to 3 side images. Supports JPEG, PNG, WebP (max 5 MB each).
              </p>
            </div>
            <MultipleImageUploadBox
              values={gallery}
              onChange={handleGalleryChange}
              disabled={isSubmitting}
            />
          </section>

          {/* Section 4: Publishing Settings */}
          <section className="p-6 border border-slate-200 rounded-lg bg-white shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <label className="grid gap-1 font-semibold text-slate-700">
                <span>Publication Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                  className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                >
                  <option value="Active">Active (Live)</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="popular-pub"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="size-4 rounded accent-[#3b338c]"
                />
                <label htmlFor="popular-pub" className="font-semibold text-slate-700 cursor-pointer">
                  Feature on Homepage Popular Grid
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/properties")}
                className="h-11 px-6 rounded font-semibold border border-slate-200 text-slate-600 bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 rounded font-semibold bg-[#3b338c] text-white hover:bg-[#2f296d] flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {isSubmitting ? "Creating..." : "Publish Property"}
              </button>
            </div>
          </section>
        </form>
      </main>
    </DashboardShell>
  );
}
