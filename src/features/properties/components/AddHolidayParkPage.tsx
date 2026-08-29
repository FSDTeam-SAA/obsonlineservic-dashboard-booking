"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, Check, CirclePercent, Grid2X2, LogOut, Plus, Search, Settings, TicketCheck } from "lucide-react";
import Link from "next/link";
import { createHolidayPark } from "@/features/holiday-parks/api/holiday-parks.api";
import { CreateHolidayParkPayload, ParkStatusType } from "@/features/holiday-parks/types";
import { ImageUploadBox } from "@/components/shared/ImageUploadBox";

const assets = {
  logo: "https://www.figma.com/api/mcp/asset/023f7a35-324e-49d9-81b3-11bf906f507e.png",
  user: "https://www.figma.com/api/mcp/asset/120640dc-bb7b-440f-9af7-8595142bf317.png",
  admin: "https://www.figma.com/api/mcp/asset/a4cec890-879f-4c79-9310-8e5c39be0a05.png",
  map: "https://www.figma.com/api/mcp/asset/33f2396e-1cd3-465e-8a78-275167afa8e2.png",
};

const navigation = [
  ["Dashboard", "/dashboard", Grid2X2],
  ["Properties", "/dashboard/properties", CalendarDays],
  ["Bookings", "/dashboard/bookings", TicketCheck],
  ["Offers", "/dashboard/offers", CirclePercent],
  ["Settings", "/dashboard/settings", Settings],
] as const;

const availableAmenities = [
  "Swimming Pool",
  "Spa",
  "Restaurant",
  "Free Parking",
  "Free Wi-Fi",
  "Kids Playground",
  "Pet Friendly",
  "Bike Rental",
  "EV Charging",
  "Gym",
];

export function AddHolidayParkPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Swimming Pool",
    "Spa",
    "Restaurant",
  ]);

  const [totalProperties, setTotalProperties] = useState("24");
  const [totalCapacity, setTotalCapacity] = useState("180 Guests");
  const [startingPrice, setStartingPrice] = useState("129");
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [receptionHours, setReceptionHours] = useState("24 Hours");

  const [country, setCountry] = useState("Netherlands");
  const [city, setCity] = useState("Utrecht");
  const [region, setRegion] = useState("Veluwe");
  const [postalCode, setPostalCode] = useState("3811 AB");

  const [heroBanner, setHeroBanner] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [status, setStatus] = useState<ParkStatusType>("Active");

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // handleFileUpload removed — ImageUploadBox manages upload internally

  const handleSubmit = async (isDraft = false) => {
    if (!name || !title) {
      setErrorMsg("Name and Title are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload: CreateHolidayParkPayload = {
        name,
        title,
        badgeLocation: `${region.toUpperCase()}, ${country.toUpperCase()}`,
        shortDescription,
        fullDescription,
        startingPrice: Number(startingPrice) || 129,
        totalCapacity,
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
        heroBanner: heroBanner || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200",
        coverImage: coverImage || "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
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
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col justify-between bg-white px-6 pb-6 pt-3 md:flex border-r border-slate-200">
        <div>
          <div className="flex h-[106px] items-center border-b border-slate-200">
            <img src={assets.logo} alt="OBS Online Service" className="max-h-20 w-full object-contain object-left" />
          </div>
          <nav className="mt-8 grid gap-2">
            {navigation.map(([label, href, Icon], index) => (
              <Link
                key={label}
                href={href}
                className={`flex h-12 items-center gap-3 rounded-md px-3 text-base transition-colors ${
                  index === 1
                    ? "bg-[#3b338c] font-bold text-white"
                    : "text-slate-700 hover:bg-violet-50"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="grid gap-6">
          <div className="flex items-center gap-3">
            <img src={assets.user} alt="Demo Name" className="size-11 rounded-full object-cover" />
            <div>
              <strong className="block text-base">Demo Name</strong>
              <span className="block text-slate-500 text-sm">Admin</span>
            </div>
          </div>
          <button className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#e53838] text-base font-semibold text-[#e53838] hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="md:ml-[260px] flex-1">
        <header className="sticky top-0 z-10 flex min-h-[100px] flex-col justify-between gap-4 border-b border-slate-200 bg-white/90 px-5 py-5 backdrop-blur md:flex-row md:items-center md:px-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1a1a1a]">Add New Holiday Park</h1>
            <p className="mt-1 text-sm text-slate-500">Create a luxury holiday park destination.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded border border-[#ddd7cd] px-4 text-slate-400 md:w-[320px] bg-white">
              <Search size={17} />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search parks, bookings..." />
            </label>
            <button aria-label="Notifications" className="relative grid size-11 place-items-center rounded border border-[#3b338c] bg-white">
              <Bell size={18} />
              <i className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-red-600" />
            </button>
            <div className="hidden items-center gap-3 sm:flex">
              <img src={assets.admin} alt="Elena Marsh" className="size-10 rounded-full border border-slate-200 object-cover" />
              <div>
                <strong className="block text-sm font-medium">Elena Marsh</strong>
                <span className="inline-block rounded-full bg-[#193b24]/10 px-2 py-0.5 text-xs uppercase text-[#3b338c]">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8 grid gap-6 max-w-5xl">
          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Holiday Park Name *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none focus:border-[#3b338c]"
                  placeholder="Nordic Pines Retreat"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Title *</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none focus:border-[#3b338c]"
                  placeholder="Nordic Pines Retreat"
                />
              </label>
            </div>

            <label className="grid gap-2 text-slate-900 text-sm font-semibold">
              <span>Short Description</span>
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none focus:border-[#3b338c]"
                placeholder="A one-line summary shown on cards"
              />
            </label>

            <label className="grid gap-2 text-slate-900 text-sm font-semibold">
              <span>Full Description</span>
              <textarea
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full h-36 p-4 border border-slate-200 rounded-lg outline-none font-sans text-sm focus:border-[#3b338c] placeholder:text-slate-400"
                placeholder="Describe the atmosphere, surroundings and experience..."
              />
            </label>
          </FormSection>

          <FormSection title="Amenities">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {availableAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <label key={amenity} className="flex items-center gap-2 text-slate-800 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="peer absolute opacity-0"
                    />
                    <span
                      className={`w-5 h-5 border rounded grid place-items-center transition-colors ${
                        isSelected
                          ? "bg-[#3b338c] border-[#3b338c] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </span>
                    {amenity}
                  </label>
                );
              })}
            </div>
          </FormSection>

          <FormSection title="Park Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Total Properties</span>
                <input
                  value={totalProperties}
                  onChange={(e) => setTotalProperties(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="24"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Total Capacity</span>
                <input
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="180 Guests"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Starting Price (Per Night)</span>
                <input
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="129"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Check-in Time</span>
                <input
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="15:00"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Check-out Time</span>
                <input
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="11:00"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Reception Hours</span>
                <input
                  value={receptionHours}
                  onChange={(e) => setReceptionHours(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="24 Hours"
                />
              </label>
            </div>
          </FormSection>

          <FormSection title="Images">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadBox
                label="Cover Image"
                hint="Card thumbnail shown in listings (recommended 600×400)"
                value={coverImage}
                onChange={setCoverImage}
                disabled={submitting}
              />
              <ImageUploadBox
                label="Hero Banner"
                hint="Full-width banner for the park detail page (recommended 1400×600)"
                value={heroBanner}
                onChange={setHeroBanner}
                disabled={submitting}
              />
            </div>
          </FormSection>

          <FormSection title="Location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Country</span>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="Netherlands"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>City</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="Utrecht"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Region</span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="Veluwe"
                />
              </label>
              <label className="grid gap-2 text-slate-900 text-sm font-semibold">
                <span>Postal Code</span>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="h-12 px-4 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="3811 AB"
                />
              </label>
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/dashboard/properties"
              className="h-11 px-6 rounded-md font-semibold border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="h-11 px-6 rounded-md font-semibold border border-[#3b338c] bg-white text-[#3b338c] hover:bg-violet-50 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="h-11 px-6 rounded-md font-semibold bg-[#3b338c] text-white hover:bg-[#312975] transition-colors disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Park"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function FormSection({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="p-6 border border-slate-200 rounded-xl bg-white shadow-xs grid gap-5">
      <h2 className="text-xl text-slate-900 font-bold">{title}</h2>
      {children}
    </section>
  );
}
