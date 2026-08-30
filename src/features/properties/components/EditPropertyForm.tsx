"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, Home } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchPropertyById, updateProperty } from "../api/properties.api";
import {
  PropertyCategory,
  PropertyStatus,
  UpdatePropertyDto,
} from "../types/properties.types";
import { api } from "@/lib/api";
import { MultipleImageUploadBox, GalleryValues } from "@/components/shared/MultipleImageUploadBox";
import axios from "axios";

interface EditPropertyFormProps {
  propertyId: string;
  parkId?: string;
}

export function EditPropertyForm({ propertyId, parkId }: EditPropertyFormProps) {
  const router = useRouter();

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Holiday Parks List
  const [holidayParksList, setHolidayParksList] = useState<
    { _id: string; title?: string; name?: string; location?: any; badgeLocation?: string }[]
  >([]);

  // Form State
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("Wellness Villas");
  const [holidayPark, setHolidayPark] = useState(parkId || "");
  const [selectedParkDetails, setSelectedParkDetails] = useState<any>(null);
  const [pricePerNight, setPricePerNight] = useState<number>(129);
  const [guests, setGuests] = useState<number>(4);
  const [beds, setBeds] = useState<number>(2);
  const [baths, setBaths] = useState<number>(2);
  const [size, setSize] = useState("");
  const [petsAllowed, setPetsAllowed] = useState(true);
  const [cleaningFee, setCleaningFee] = useState<number>(80);
  const [taxes, setTaxes] = useState<number>(45);
  const [description, setDescription] = useState("");

  // Gallery
  const [gallery, setGallery] = useState<GalleryValues>({
    main: "",
    side1: "",
    side2: "",
    side3: "",
  });

  const [status, setStatus] = useState<PropertyStatus>("Active");
  const [isPopular, setIsPopular] = useState(false);

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

        let parksItems: any[] = [];
        if (parksRes.status === "fulfilled") {
          const res = parksRes.value;
          if (res.data && res.data.items) {
            parksItems = res.data.items;
          } else if (Array.isArray(res.data)) {
            parksItems = res.data;
          }
          setHolidayParksList(parksItems);
        }

        if (propertyRes.status === "fulfilled") {
          const p = propertyRes.value;
          setTitle(p.title || "");
          setBadge(p.badge || "FEATURED LODGE");
          setCategory(p.category || "Wellness Villas");

          const pParkId =
            typeof p.holidayPark === "object" && p.holidayPark !== null
              ? p.holidayPark._id
              : p.holidayPark || parkId || "";
          setHolidayPark(pParkId);

          if (typeof p.holidayPark === "object" && p.holidayPark !== null) {
            setSelectedParkDetails(p.holidayPark);
          } else if (pParkId && parksItems.length > 0) {
            const matched = parksItems.find((hp) => hp._id === pParkId);
            if (matched) setSelectedParkDetails(matched);
          }

          setPricePerNight(p.pricePerNight ?? 129);
          setGuests(p.guests ?? 4);
          setBeds(p.beds ?? 2);
          setBaths(p.baths ?? 2);
          setSize(p.size || "240 m²");
          setPetsAllowed(p.petsAllowed ?? true);
          setCleaningFee(p.cleaningFee ?? 80);
          setTaxes(p.taxes ?? 45);
          setDescription(p.description || "");

          setGallery({
            main: p.gallery?.main || "",
            side1: p.gallery?.side1 || "",
            side2: p.gallery?.side2 || "",
            side3: p.gallery?.side3 || "",
          });

          setStatus(p.status || "Active");
          setIsPopular(p.isPopular ?? false);
        } else {
          const err = propertyRes.reason;
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            setErrorMsg("Property not found. It may have been deleted.");
          } else {
            setErrorMsg("Failed to load property details. Please try again.");
          }
        }
      } catch (err: unknown) {
        if (isMounted) setErrorMsg("An unexpected error occurred while loading data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [propertyId, parkId]);

  const handleGalleryChange = (key: keyof GalleryValues, url: string) => {
    setGallery((prev) => ({ ...prev, [key]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim()) {
      setErrorMsg("Property Title is required.");
      return;
    }

    if (Number(pricePerNight) < 0) {
      setErrorMsg("Price per night must be a non-negative number.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: UpdatePropertyDto = {
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
          main: gallery.main.trim(),
          side1: gallery.side1.trim(),
          side2: gallery.side2.trim(),
          side3: gallery.side3.trim(),
        },
        status,
        isPopular,
      };

      await updateProperty(propertyId, payload);
      setSuccessMsg("Property updated successfully!");

      const targetParkId = parkId || holidayPark;
      setTimeout(() => {
        if (targetParkId) {
          router.push(`/dashboard/holiday-parks/${targetParkId}/properties`);
        } else {
          router.push("/dashboard/holiday-parks");
        }
      }, 600);
    } catch (err: unknown) {
      console.error("Failed to update property:", err);
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setErrorMsg(typeof msg === "string" ? msg : "Failed to update property.");
      } else {
        setErrorMsg("Failed to update property. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetParkId = parkId || holidayPark;
  const backHref = targetParkId ? `/dashboard/holiday-parks/${targetParkId}/properties` : "/dashboard/holiday-parks";

  return (
    <DashboardShell
      active="Holiday Parks"
      title="Edit Property"
      subtitle={`Update listing details for property ID: ${propertyId}`}
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
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg"
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg"
          >
            {successMsg}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center border border-slate-200 rounded-lg bg-white shadow-2xs">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3b338c]" />
            <p className="mt-3 text-sm font-medium text-slate-600">Loading property details...</p>
          </div>
        ) : (
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
                    min="0"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                  />
                </label>

                <label className="grid gap-1.5 font-semibold text-slate-700">
                  <span>Max Guests</span>
                  <input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                  />
                </label>

                <label className="grid gap-1.5 font-semibold text-slate-700">
                  <span>Beds</span>
                  <input
                    type="number"
                    min="1"
                    value={beds}
                    onChange={(e) => setBeds(Number(e.target.value))}
                    className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                  />
                </label>

                <label className="grid gap-1.5 font-semibold text-slate-700">
                  <span>Baths</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
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
                    min="0"
                    value={cleaningFee}
                    onChange={(e) => setCleaningFee(Number(e.target.value))}
                    className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                  />
                </label>

                <label className="grid gap-1.5 font-semibold text-slate-700">
                  <span>Taxes (€)</span>
                  <input
                    type="number"
                    min="0"
                    value={taxes}
                    onChange={(e) => setTaxes(Number(e.target.value))}
                    className="h-10 px-3 border border-slate-200 rounded outline-none focus:border-[#3b338c]"
                  />
                </label>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pets-allowed-edit"
                    checked={petsAllowed}
                    onChange={(e) => setPetsAllowed(e.target.checked)}
                    className="size-4 rounded accent-[#3b338c]"
                  />
                  <label
                    htmlFor="pets-allowed-edit"
                    className="font-semibold text-slate-700 cursor-pointer"
                  >
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
                  Upload or update URLs for the main photo and up to 3 side images. Supports JPEG,
                  PNG, WebP (max 5 MB each).
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
                    id="popular-pub-edit"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="size-4 rounded accent-[#3b338c]"
                  />
                  <label
                    htmlFor="popular-pub-edit"
                    className="font-semibold text-slate-700 cursor-pointer"
                  >
                    Feature on Homepage Popular Grid
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/properties")}
                  className="h-11 px-6 rounded font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded font-semibold bg-[#3b338c] text-white hover:bg-[#2f296d] flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <Save size={18} />
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </section>
          </form>
        )}
      </main>
    </DashboardShell>
  );
}
