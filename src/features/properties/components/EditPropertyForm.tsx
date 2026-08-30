"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Plus,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchPropertyById, updateProperty } from "../api/properties.api";
import {
  PropertyCategory,
  PropertyStatus,
  UpdatePropertyDto,
} from "../types/properties.types";
import { api } from "@/lib/api";
import { MultipleImageUploadBox, GalleryValues } from "@/components/shared/MultipleImageUploadBox";
import { CounterInput } from "@/components/shared/CounterInput";
import { RichTextArea } from "@/components/shared/RichTextArea";
import { GoogleMapPreview } from "@/components/shared/GoogleMapPreview";

interface EditPropertyFormProps {
  propertyId: string;
  parkId?: string;
}

const PROPERTY_TYPES = [
  { id: "Villa", label: "Villa", icon: "🏡" },
  { id: "Cabin", label: "Cabin", icon: "🪵" },
  { id: "Apartment", label: "Apartment", icon: "🏢" },
  { id: "Suite", label: "Suite", icon: "🏨" },
  { id: "Lodge", label: "Lodge", icon: "🛖" },
  { id: "Tiny House", label: "Tiny House", icon: "🏠" },
];

const DEFAULT_FEATURES = [
  { id: "Breakfast Included", label: "Breakfast Included", icon: "🥐" },
  { id: "Fireplace", label: "Fireplace", icon: "🔥" },
  { id: "Mountain View", label: "Mountain View", icon: "🏔️" },
  { id: "Wheelchair Accessible", label: "Wheelchair Accessible", icon: "♿" },
  { id: "Air Conditioning", label: "Air Conditioning", icon: "❄️" },
  { id: "Pet Friendly", label: "Pet Friendly", icon: "🐶" },
  { id: "Private Parking", label: "Private Parking", icon: "🚗" },
  { id: "Lake View", label: "Lake View", icon: "🌊" },
  { id: "Garden View", label: "Garden View", icon: "🪴" },
  { id: "Swimming Pool", label: "Swimming Pool", icon: "🏊" },
];

export function EditPropertyForm({ propertyId, parkId }: EditPropertyFormProps) {
  const router = useRouter();

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Basic Info State
  const [title, setTitle] = useState("");
  const [holidayPark, setHolidayPark] = useState(parkId || "");
  const [propertyCode, setPropertyCode] = useState("NP-2048");
  const [propertyType, setPropertyType] = useState("Villa");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("FEATURED LODGE");
  const [category, setCategory] = useState<PropertyCategory>("Wellness Villas");

  // Property Details State (Counters)
  const [guests, setGuests] = useState<number>(8);
  const [bedrooms, setBedrooms] = useState<number>(4);
  const [baths, setBaths] = useState<number>(2);
  const [beds, setBeds] = useState<number>(5);
  const [propertySize, setPropertySize] = useState<number>(140);
  const [floor, setFloor] = useState<number>(2);

  // Property Features State
  const [featuresList, setFeaturesList] = useState(DEFAULT_FEATURES);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Breakfast Included",
    "Fireplace",
    "Mountain View",
    "Air Conditioning",
    "Private Parking",
  ]);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [showAddFeature, setShowAddFeature] = useState(false);

  // Park Information & Pricing
  const [pricePerNight, setPricePerNight] = useState<number>(94);
  const [totalCapacity, setTotalCapacity] = useState<number>(180);
  const [startingPrice, setStartingPrice] = useState<number>(120);
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [receptionHours, setReceptionHours] = useState("24 Hours");

  // Gallery
  const [gallery, setGallery] = useState<GalleryValues>({
    main: "",
    side1: "",
    side2: "",
    side3: "",
  });

  // Location
  const [country, setCountry] = useState("Netherlands");
  const [city, setCity] = useState("Utrecht");
  const [region, setRegion] = useState("Veluwe");
  const [googleMapLocation, setGoogleMapLocation] = useState("");
  const [postalCode, setPostalCode] = useState("3511 AR");

  // Holiday Parks List
  const [holidayParksList, setHolidayParksList] = useState<any[]>([]);
  const [status, setStatus] = useState<PropertyStatus>("Active");

  // Load Property Details & Holiday Parks
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMsg("");

      try {
        const [propertyRes, parksRes] = await Promise.allSettled([
          fetchPropertyById(propertyId),
          api.get("/holiday-parks"),
        ]);

        if (!isMounted) return;

        if (parksRes.status === "fulfilled") {
          const res = parksRes.value;
          let items: any[] = [];
          if (res.data && res.data.items) {
            items = res.data.items;
          } else if (Array.isArray(res.data)) {
            items = res.data;
          }
          setHolidayParksList(items);
        }

        if (propertyRes.status === "fulfilled") {
          const p = propertyRes.value;
          setTitle(p.title || "");
          setBadge(p.badge || "FEATURED LODGE");
          setCategory(p.category || "Wellness Villas");
          setShortDescription(p.badge || "Luxury holiday property");
          setDescription(p.description || "");
          setPricePerNight(p.pricePerNight || 94);
          setGuests(p.guests || 8);
          setBeds(p.beds || 5);
          setBaths(p.baths || 2);
          setBedrooms(Math.max(1, Math.floor((p.beds || 5) / 1.2)));

          const parsedSize = parseInt(p.size || "140", 10);
          if (!isNaN(parsedSize)) setPropertySize(parsedSize);

          if (p.gallery) {
            setGallery({
              main: p.gallery.main || "",
              side1: p.gallery.side1 || "",
              side2: p.gallery.side2 || "",
              side3: p.gallery.side3 || "",
            });
          }

          if (p.petsAllowed) {
            setSelectedFeatures((prev) => Array.from(new Set([...prev, "Pet Friendly"])));
          }

          setStatus(p.status || "Active");

          const pParkId =
            typeof p.holidayPark === "object" && p.holidayPark !== null
              ? (p.holidayPark as any)._id
              : p.holidayPark || parkId || "";
          setHolidayPark(pParkId);

          if (typeof p.holidayPark === "object" && p.holidayPark !== null) {
            const hp: any = p.holidayPark;
            if (hp.location) {
              if (hp.location.country) setCountry(hp.location.country);
              if (hp.location.city) setCity(hp.location.city);
              if (hp.location.region) setRegion(hp.location.region);
              if (hp.location.postalCode) setPostalCode(hp.location.postalCode);
            }
          }
        } else {
          setErrorMsg("Failed to load property data.");
        }
      } catch (err) {
        console.error("Error loading property edit data:", err);
        setErrorMsg("Failed to load property details.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (propertyId) loadData();
    return () => { isMounted = false; };
  }, [propertyId, parkId]);

  const handleGalleryChange = (key: keyof GalleryValues, url: string) => {
    setGallery((prev) => ({ ...prev, [key]: url }));
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((f) => f !== featureId)
        : [...prev, featureId]
    );
  };

  const handleAddCustomFeature = () => {
    if (!newFeatureName.trim()) return;
    const name = newFeatureName.trim();
    if (!featuresList.some((f) => f.id === name)) {
      const newFeature = { id: name, label: name, icon: "✨" };
      setFeaturesList((prev) => [...prev, newFeature]);
      setSelectedFeatures((prev) => [...prev, name]);
    }
    setNewFeatureName("");
    setShowAddFeature(false);
  };

  const handleSubmit = async (isDraft = false) => {
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Property Name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: UpdatePropertyDto = {
        title: title.trim(),
        badge: badge.trim() || propertyType,
        category,
        holidayPark: holidayPark || undefined,
        description: description.trim() || shortDescription.trim(),
        pricePerNight: Number(pricePerNight),
        guests: Number(guests),
        beds: Number(beds),
        baths: Number(baths),
        size: `${propertySize} m²`,
        petsAllowed: selectedFeatures.includes("Pet Friendly"),
        cleaningFee: 80,
        taxes: 45,
        gallery: {
          main: gallery.main.trim(),
          side1: gallery.side1.trim(),
          side2: gallery.side2.trim(),
          side3: gallery.side3.trim(),
        },
        status: isDraft ? ("Draft" as PropertyStatus) : status,
        isPopular: true,
      };

      await updateProperty(propertyId, payload);
      if (holidayPark) {
        router.push(`/dashboard/holiday-parks/${holidayPark}/properties`);
      } else {
        router.push("/dashboard/properties");
      }
    } catch (err: any) {
      console.error("Failed to update property:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to update property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref = holidayPark ? `/dashboard/holiday-parks/${holidayPark}/properties` : "/dashboard/properties";

  if (isLoading) {
    return (
      <DashboardShell active="Properties" title="Loading Property..." subtitle="Fetching property details.">
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#30277a]" />
          <span className="text-xs font-semibold">Loading Property Specifications...</span>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      active="Properties"
      title="Welcome back 👋"
      subtitle="Manage your luxury holiday destinations from one beautiful workspace."
    >
      <main className="p-4 md:p-8 font-sans grid gap-6 max-w-6xl mx-auto pb-24">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#30277a] transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Properties List
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="grid gap-6">
          {/* Section 1: Basic Information */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Property Name *</span>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nordic Pines Retreat"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Holiday Park</span>
                <select
                  value={holidayPark}
                  onChange={(e) => setHolidayPark(e.target.value)}
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs font-medium"
                >
                  <option value="">Northshore Collection</option>
                  {holidayParksList.map((hp) => (
                    <option key={hp._id} value={hp._id}>
                      {hp.title || hp.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Property Code</span>
                <input
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
                  placeholder="NP-2048"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs uppercase tracking-wider font-semibold"
                />
              </label>
            </div>

            {/* Property Type Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-800 block">Property Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {PROPERTY_TYPES.map((type) => {
                  const isSelected = propertyType === type.id;
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => {
                        setPropertyType(type.id);
                        if (type.id === "Villa") setCategory("Wellness Villas");
                        else if (type.id === "Cabin") setCategory("Cabins & Lodges");
                        else setCategory("Lakefront");
                      }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#30277a] bg-[#30277a]/5 text-[#30277a] shadow-2xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-base">{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Short Description */}
            <label className="grid gap-1.5 font-semibold text-slate-800 text-xs">
              <span>Short Description</span>
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A one-line summary shown on cards"
                className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#30277a] bg-white text-slate-800 text-xs"
              />
            </label>

            {/* Full Description */}
            <RichTextArea
              label="Full Description"
              value={description}
              onChange={setDescription}
              placeholder="Describe the atmosphere, surroundings and experience..."
            />
          </section>

          {/* Section 2: Property Details */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Property Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <CounterInput
                label="Maximum Guests"
                value={guests}
                onChange={setGuests}
                min={1}
                max={30}
              />
              <CounterInput
                label="Bedrooms"
                value={bedrooms}
                onChange={setBedrooms}
                min={1}
                max={15}
              />
              <CounterInput
                label="Bathrooms"
                value={baths}
                onChange={setBaths}
                min={1}
                max={10}
              />
              <CounterInput
                label="Beds"
                value={beds}
                onChange={setBeds}
                min={1}
                max={20}
              />
              <CounterInput
                label="Property Size (m²)"
                value={propertySize}
                onChange={setPropertySize}
                min={10}
                max={1000}
                step={5}
              />
              <CounterInput
                label="Floor"
                value={floor}
                onChange={setFloor}
                min={1}
                max={50}
              />
            </div>
          </section>

          {/* Section 3: Property Features */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Property Features</h2>
              {showAddFeature && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="Feature name..."
                    className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#30277a]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFeature}
                    className="h-8 px-3 bg-[#30277a] text-white text-xs font-semibold rounded-lg hover:bg-[#251e60]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFeature(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {featuresList.map((feat) => {
                const isSelected = selectedFeatures.includes(feat.id);
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => toggleFeature(feat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-[#30277a] bg-[#30277a]/5 text-[#30277a]"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{feat.icon}</span>
                    <span>{feat.label}</span>
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                      isSelected ? "border-[#30277a] bg-[#30277a] text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && "✓"}
                    </span>
                  </button>
                );
              })}

              {!showAddFeature && (
                <button
                  type="button"
                  onClick={() => setShowAddFeature(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-[#30277a] bg-[#30277a]/5 text-[#30277a] text-xs font-bold hover:bg-[#30277a]/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Add</span>
                </button>
              )}
            </div>
          </section>

          {/* Section 4: Park Information / Pricing */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Park Information & Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CounterInput
                label="Price Per Night (€)"
                value={pricePerNight}
                onChange={setPricePerNight}
                min={10}
                max={5000}
                step={5}
              />
              <CounterInput
                label="Total Capacity"
                value={totalCapacity}
                onChange={setTotalCapacity}
                min={10}
                max={1000}
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

          {/* Section 5: Gallery */}
          <section className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Gallery</h2>
            <MultipleImageUploadBox
              values={gallery}
              onChange={handleGalleryChange}
              disabled={isSubmitting}
            />
          </section>

          {/* Section 6: Location */}
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
              locationName={title || "Nordic Pines Retreat"}
              city={city}
              country={country}
            />
          </section>

          {/* Fixed Footer Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Sparkles className="w-4 h-4 text-[#30277a]" />
                <span>{title || "Nordic Pines Review"} · <span className="text-emerald-600 font-bold">Ready to publish</span></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push(backHref)}
                  className="h-10 px-5 rounded-xl font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-xl font-semibold border border-[#30277a] text-[#30277a] bg-white hover:bg-[#30277a]/5 text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 rounded-xl font-semibold bg-[#30277a] text-white hover:bg-[#231b5c] text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Property"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </DashboardShell>
  );
}
