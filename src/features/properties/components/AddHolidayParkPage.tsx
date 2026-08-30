"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { createHolidayPark } from "@/features/holiday-parks/api/holiday-parks.api";
import { CreateHolidayParkPayload, ParkStatusType } from "@/features/holiday-parks/types";
import { MultipleImageUploadBox, GalleryValues } from "@/components/shared/MultipleImageUploadBox";
import { CounterInput } from "@/components/shared/CounterInput";
import { RichTextArea } from "@/components/shared/RichTextArea";
import { GoogleMapPreview } from "@/components/shared/GoogleMapPreview";

const DEFAULT_AMENITIES = [
  { id: "Swimming Pool", label: "Swimming Pool", icon: "🏊" },
  { id: "Spa", label: "Spa", icon: "♨️" },
  { id: "Restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "Free Parking", label: "Free Parking", icon: "🚗" },
  { id: "Free Wi-Fi", label: "Free Wi-Fi", icon: "📶" },
  { id: "Kids Playground", label: "Kids Playground", icon: "🛝" },
  { id: "Pet Friendly", label: "Pet Friendly", icon: "🐶" },
  { id: "Bike Rental", label: "Bike Rental", icon: "🚴" },
  { id: "EV Charging", label: "EV Charging", icon: "⚡" },
  { id: "Gym", label: "Gym", icon: "🏋️" },
];

export function AddHolidayParkPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Basic Information
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");

  // Amenities State
  const [amenitiesList, setAmenitiesList] = useState(DEFAULT_AMENITIES);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Swimming Pool",
    "Spa",
    "Restaurant",
    "Free Wi-Fi",
  ]);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [showAddAmenity, setShowAddAmenity] = useState(false);

  // Park Information (Counters & Timings)
  const [totalProperties, setTotalProperties] = useState<number>(24);
  const [totalCapacity, setTotalCapacity] = useState<number>(180);
  const [startingPrice, setStartingPrice] = useState<number>(129);
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [receptionHours, setReceptionHours] = useState("24 Hours");

  // Gallery
  const [gallery, setGallery] = useState<GalleryValues>({
    main: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200",
    side1: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
    side2: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600",
    side3: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600",
  });

  // Location
  const [country, setCountry] = useState("Netherlands");
  const [city, setCity] = useState("Utrecht");
  const [region, setRegion] = useState("Veluwe");
  const [googleMapLocation, setGoogleMapLocation] = useState("");
  const [postalCode, setPostalCode] = useState("3511 AR");

  const [isFeatured, setIsFeatured] = useState(true);
  const [status, setStatus] = useState<ParkStatusType>("Active");

  const handleGalleryChange = (key: keyof GalleryValues, url: string) => {
    setGallery((prev) => ({ ...prev, [key]: url }));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!newAmenityName.trim()) return;
    const name = newAmenityName.trim();
    if (!amenitiesList.some((a) => a.id === name)) {
      const newAmenity = { id: name, label: name, icon: "✨" };
      setAmenitiesList((prev) => [...prev, newAmenity]);
      setSelectedAmenities((prev) => [...prev, name]);
    }
    setNewAmenityName("");
    setShowAddAmenity(false);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!name || !title) {
      setErrorMsg("Holiday Park Name and Title are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload: CreateHolidayParkPayload = {
        name: name.trim(),
        title: title.trim(),
        badgeLocation: `${region.toUpperCase()}, ${country.toUpperCase()}`,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        startingPrice: Number(startingPrice) || 129,
        totalCapacity: `${totalCapacity} Guests`,
        totalProperties: Number(totalProperties) || 24,
        availableProperties: Number(totalProperties) || 24,
        checkInTime,
        checkOutTime,
        receptionHours,
        amenities: selectedAmenities,
        location: {
          country,
          city,
          region,
          postalCode,
        },
        heroBanner: gallery.main || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200",
        coverImage: gallery.side1 || "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
        isFeatured,
        status: isDraft ? "Inactive" : status,
      };

      await createHolidayPark(payload);
      router.push("/dashboard/properties");
    } catch (err: any) {
      console.error("Failed to create holiday park:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to create holiday park.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      active="Properties"
      title="Properties"
      subtitle="Manage your luxury holiday destinations from one beautiful workspace."
    >
      <main className="p-4 md:p-8 font-sans grid gap-6 max-w-6xl mx-auto pb-24">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/properties"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#30277a] transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Holiday Parks List
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="grid gap-6">
          {/* Section 1: Basic Information */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Holiday Park Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nordic Pines Retreat"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Title *</span>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter folder name"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>
            </div>

            <label className="grid gap-1.5 font-semibold text-slate-800 text-xs">
              <span>Short Description</span>
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A one-line summary shown on cards"
                className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
              />
            </label>

            <RichTextArea
              label="Full Description"
              value={fullDescription}
              onChange={setFullDescription}
              placeholder="Describe the atmosphere, surroundings and experience..."
            />
          </section>

          {/* Section 2: Amenities */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Amenities</h2>
              {showAddAmenity && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAmenityName}
                    onChange={(e) => setNewAmenityName(e.target.value)}
                    placeholder="Amenity name..."
                    className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#30277a]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="h-8 px-3 bg-[#30277a] text-white text-xs font-semibold rounded-lg hover:bg-[#251e60]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAmenity(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {amenitiesList.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-[#30277a] bg-[#30277a]/5 text-[#30277a]"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{amenity.icon}</span>
                    <span>{amenity.label}</span>
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                      isSelected ? "border-[#30277a] bg-[#30277a] text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && "✓"}
                    </span>
                  </button>
                );
              })}

              {!showAddAmenity && (
                <button
                  type="button"
                  onClick={() => setShowAddAmenity(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-[#30277a] bg-[#30277a]/5 text-[#30277a] text-xs font-bold hover:bg-[#30277a]/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Add</span>
                </button>
              )}
            </div>
          </section>

          {/* Section 3: Park Information */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Park Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CounterInput
                label="Total Properties"
                value={totalProperties}
                onChange={setTotalProperties}
                min={1}
                max={500}
              />
              <CounterInput
                label="Total Capacity"
                value={totalCapacity}
                onChange={setTotalCapacity}
                min={10}
                max={5000}
                step={10}
                unit="Guests"
              />
              <CounterInput
                label="Starting Price (Per Night)"
                value={startingPrice}
                onChange={setStartingPrice}
                min={10}
                max={2000}
                step={5}
                unit="€"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-800 block">Check-in Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full h-10 px-3.5 pr-9 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] text-xs font-semibold text-slate-800"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-800 block">Check-out Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full h-10 px-3.5 pr-9 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] text-xs font-semibold text-slate-800"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-800 block">Reception Hours</label>
                <select
                  value={receptionHours}
                  onChange={(e) => setReceptionHours(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="24 Hours">24 Hours</option>
                  <option value="08:00 - 22:00">08:00 - 22:00</option>
                  <option value="09:00 - 18:00">09:00 - 18:00</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 4: Gallery */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Gallery</h2>
            <MultipleImageUploadBox
              values={gallery}
              onChange={handleGalleryChange}
              disabled={submitting}
            />
          </section>

          {/* Section 5: Location */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Location</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Country</span>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Netherlands"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>City</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Utrecht"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Region</span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Veluwe"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="sm:col-span-2 grid gap-1.5 font-semibold text-slate-800">
                <span>Google Map Location</span>
                <input
                  value={googleMapLocation}
                  onChange={(e) => setGoogleMapLocation(e.target.value)}
                  placeholder="A one-line summary shown on cards"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Postal Code</span>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 3511 AR"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>
            </div>

            {/* Interactive Map Visual */}
            <GoogleMapPreview
              locationName={name || title || "Nordic Pines Retreat"}
              city={city}
              country={country}
            />
          </section>

          {/* Fixed Footer Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Sparkles className="w-4 h-4 text-[#30277a]" />
                <span>{name || title || "Nordic Pines Review"} · <span className="text-emerald-600 font-bold">Ready to publish</span></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/properties")}
                  className="h-10 px-5 rounded-xl font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="h-10 px-5 rounded-xl font-semibold border border-[#30277a] text-[#30277a] bg-white hover:bg-[#30277a]/5 text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-6 rounded-xl font-semibold bg-[#30277a] text-white hover:bg-[#231b5c] text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Park"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </DashboardShell>
  );
}
