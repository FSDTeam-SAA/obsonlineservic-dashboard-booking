"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import { fetchHolidayParkDetails, updateHolidayPark } from "@/features/holiday-parks/api/holiday-parks.api";
import { UpdateHolidayParkPayload, ParkStatusType, HolidayParkItem } from "@/features/holiday-parks/types";
import { ImageUploadBox } from "@/components/shared/ImageUploadBox";

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

export function EditHolidayParkPage({ parkId }: { parkId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [totalProperties, setTotalProperties] = useState("24");
  const [totalCapacity, setTotalCapacity] = useState("180 Guests");
  const [startingPrice, setStartingPrice] = useState("129");
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [receptionHours, setReceptionHours] = useState("24 Hours");

  const [country, setCountry] = useState("Netherlands");
  const [city, setCity] = useState("Utrecht");
  const [region, setRegion] = useState("Veluwe");
  const [postalCode, setPostalCode] = useState("3500");

  const [coverImage, setCoverImage] = useState("");
  const [heroBanner, setHeroBanner] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [status, setStatus] = useState<ParkStatusType>("Active");

  useEffect(() => {
    async function loadPark() {
      try {
        setLoading(true);
        const data: HolidayParkItem = await fetchHolidayParkDetails(parkId) as any;
        if (data) {
          setName(data.name || "");
          setTitle(data.title || "");
          setShortDescription(data.shortDescription || "");
          setFullDescription(data.fullDescription || "");
          setSelectedAmenities(data.amenities || []);
          setTotalProperties(data.totalProperties ? String(data.totalProperties) : "24");
          setTotalCapacity(data.totalCapacity || "180 Guests");
          setStartingPrice(data.startingPrice ? String(data.startingPrice) : "129");
          setCheckInTime(data.checkInTime || "15:00");
          setCheckOutTime(data.checkOutTime || "11:00");
          setReceptionHours(data.receptionHours || "24 Hours");

          if (data.location) {
            setCountry(data.location.country || "Netherlands");
            setCity(data.location.city || "");
            setRegion(data.location.region || "");
            setPostalCode(data.location.postalCode || "");
          }

          setCoverImage(data.coverImage || "");
          setHeroBanner(data.heroBanner || "");
          setIsFeatured(data.isFeatured ?? true);
          setStatus((data.status as ParkStatusType) || "Active");
        }
      } catch (err) {
        console.error("Failed to fetch park details:", err);
        setErrorMsg("Failed to load holiday park details.");
      } finally {
        setLoading(false);
      }
    }
    if (parkId) {
      void loadPark();
    }
  }, [parkId]);

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title) {
      setErrorMsg("Name and Title are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload: UpdateHolidayParkPayload = {
        name,
        title,
        shortDescription,
        fullDescription,
        amenities: selectedAmenities,
        totalProperties: Number(totalProperties) || 0,
        totalCapacity,
        startingPrice: Number(startingPrice) || 0,
        checkInTime,
        checkOutTime,
        receptionHours,
        location: {
          country,
          city,
          region,
          postalCode,
        },
        heroBanner,
        coverImage,
        isFeatured,
        status,
      };

      await updateHolidayPark(parkId, payload);
      router.push("/dashboard/holiday-parks");
    } catch (err: any) {
      console.error("Failed to update holiday park:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to update holiday park.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      active="Holiday Parks"
      title="Edit Holiday Park"
      subtitle={`Update parameters and locations for ${title || name || "Holiday Park"}`}
    >
      <main className="p-5 md:p-8 grid gap-6 max-w-5xl mx-auto font-sans">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/holiday-parks"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3b338c] transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Holiday Parks List
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center border border-slate-200 rounded-xl bg-white text-slate-500 text-xs font-medium">
            Loading Holiday Park details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6">
            <FormSection title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Holiday Park Name *</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none focus:border-[#3b338c]"
                  />
                </label>
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Title *</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none focus:border-[#3b338c]"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                <span>Short Description</span>
                <input
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none focus:border-[#3b338c]"
                />
              </label>

              <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                <span>Full Description</span>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="w-full h-32 p-3 border border-slate-200 rounded-lg outline-none font-sans text-xs focus:border-[#3b338c]"
                />
              </label>
            </FormSection>

            <FormSection title="Status & Features">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ParkStatusType)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 pt-6 text-slate-900 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-4 accent-[#3b338c]"
                  />
                  <span>Is Featured on Homepage</span>
                </label>
              </div>
            </FormSection>

            <FormSection title="Amenities">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {availableAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <label key={amenity} className="flex items-center gap-2 text-slate-800 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="peer absolute opacity-0"
                      />
                      <span
                        className={`w-4 h-4 border rounded grid place-items-center transition-colors ${
                          isSelected
                            ? "bg-[#3b338c] border-[#3b338c] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                      </span>
                      {amenity}
                    </label>
                  );
                })}
              </div>
            </FormSection>

            <FormSection title="Park Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Total Properties</span>
                  <input
                    value={totalProperties}
                    onChange={(e) => setTotalProperties(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
                  />
                </label>
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Total Capacity</span>
                  <input
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
                  />
                </label>
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Starting Price (Per Night)</span>
                  <input
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
                  />
                </label>
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Check-in Time</span>
                  <input
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
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

            <FormSection title="Location (Inherited by Properties)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Country</span>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
                  />
                </label>
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>City</span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
                  />
                </label>
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Region</span>
                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
                  />
                </label>
                <label className="grid gap-2 text-slate-900 text-xs font-semibold">
                  <span>Postal Code</span>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-slate-900 text-xs outline-none"
                  />
                </label>
              </div>
            </FormSection>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/dashboard/holiday-parks"
                className="h-10 px-5 rounded-lg font-semibold text-xs border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-5 rounded-lg font-semibold text-xs bg-[#3b338c] text-white hover:bg-[#312975] transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </main>
    </DashboardShell>
  );
}

function FormSection({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="p-6 border border-slate-200 rounded-xl bg-white shadow-xs grid gap-5">
      <h2 className="text-sm text-slate-900 font-bold">{title}</h2>
      {children}
    </section>
  );
}
