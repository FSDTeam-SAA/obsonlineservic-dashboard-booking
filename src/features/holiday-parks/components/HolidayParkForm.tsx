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
  TreePine,
  MapPin,
  Image as ImageIcon,
  ShieldCheck,
  Star,
  CheckCircle2,
  Euro,
  Users,
  Home,
  Compass,
  Trash2,
  Globe,
  Tag,
  FileText,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { ImageUploadBox } from "@/components/shared/ImageUploadBox";
import { MultipleImageUploadBox, GalleryValues } from "@/components/shared/MultipleImageUploadBox";
import { CounterInput } from "@/components/shared/CounterInput";
import { RichTextArea } from "@/components/shared/RichTextArea";
import { GoogleMapPreview } from "@/components/shared/GoogleMapPreview";
import {
  HolidayPark,
  CreateHolidayParkDto,
  UpdateHolidayParkDto,
  CustomAmenityDto,
  ParkStatusType,
} from "../types/holiday-parks.types";
import { createHolidayPark, updateHolidayPark } from "../api/holiday-parks.api";

const DEFAULT_AMENITIES = [
  { id: "Swimming Pool", label: "Swimming Pool", icon: "🏊" },
  { id: "Spa & Sauna", label: "Spa & Sauna", icon: "♨️" },
  { id: "Restaurant & Bar", label: "Restaurant & Bar", icon: "🍽️" },
  { id: "Free Parking", label: "Free Parking", icon: "🚗" },
  { id: "Free High-Speed Wi-Fi", label: "Free Wi-Fi", icon: "📶" },
  { id: "Kids Playground", label: "Kids Playground", icon: "🛝" },
  { id: "Pet Friendly", label: "Pet Friendly", icon: "🐶" },
  { id: "Electric Bike Rental", label: "Bike Rental", icon: "🚴" },
  { id: "EV Charging Station", label: "EV Charging", icon: "⚡" },
  { id: "Fitness & Gym Center", label: "Gym Center", icon: "🏋️" },
  { id: "Private Beach Access", label: "Private Beach", icon: "🏖️" },
  { id: "Concierge Service", label: "Concierge", icon: "🛎️" },
];

interface HolidayParkFormProps {
  mode: "add" | "edit";
  initialData?: HolidayPark;
  parkId?: string;
}

export function HolidayParkForm({ mode, initialData, parkId }: HolidayParkFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basic" | "specs" | "amenities" | "location" | "media">("basic");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab 1: Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || "");
  const [paragraphs, setParagraphs] = useState<string[]>(initialData?.paragraphs || []);
  const [newParagraph, setNewParagraph] = useState("");

  // Tab 2: Specs & Timings
  const [startingPrice, setStartingPrice] = useState<number>(initialData?.startingPrice || 129);
  const [currency, setCurrency] = useState(initialData?.currency || "€");
  const [totalProperties, setTotalProperties] = useState<number>(initialData?.totalProperties || 24);
  const [availableProperties, setAvailableProperties] = useState<number>(initialData?.availableProperties || initialData?.totalProperties || 24);
  const [totalCapacity, setTotalCapacity] = useState<string>(initialData?.totalCapacity || "180 Guests");
  const [checkInTime, setCheckInTime] = useState(initialData?.checkInTime || "15:00");
  const [checkOutTime, setCheckOutTime] = useState(initialData?.checkOutTime || "11:00");
  const [receptionHours, setReceptionHours] = useState(initialData?.receptionHours || "24 Hours");
  const [rating, setRating] = useState<number>(initialData?.rating || 4.88);
  const [reviewsCount, setReviewsCount] = useState<number>(initialData?.reviewsCount || 1248);

  // Tab 3: Amenities & Eco Badge
  const [amenitiesList, setAmenitiesList] = useState(DEFAULT_AMENITIES);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || []);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [showAddAmenity, setShowAddAmenity] = useState(false);

  // Featured Amenities
  const [featuredAmenities, setFeaturedAmenities] = useState<CustomAmenityDto[]>(
    initialData?.featuredAmenities || [
      { title: "Forest Spa & Sauna", description: "Organic herbal steam baths and heated pools", iconName: "Sparkles" },
    ]
  );
  const [newFeatTitle, setNewFeatTitle] = useState("");
  const [newFeatDesc, setNewFeatDesc] = useState("");
  const [newFeatIcon, setNewFeatIcon] = useState("Sparkles");

  // Eco Badge
  const [ecoTagline, setEcoTagline] = useState(initialData?.ecoBadge?.tagline || "CERTIFIED ECO-PARK");
  const [ecoTitle, setEcoTitle] = useState(initialData?.ecoBadge?.title || "100% Sustainable Stay");

  // Tab 4: Location
  const [country, setCountry] = useState(initialData?.location?.country || "Netherlands");
  const [city, setCity] = useState(initialData?.location?.city || "Utrecht");
  const [region, setRegion] = useState(initialData?.location?.region || "Veluwe");
  const [postalCode, setPostalCode] = useState(initialData?.location?.postalCode || "3811 AB");
  const [formattedAddress, setFormattedAddress] = useState(initialData?.location?.formattedAddress || "");
  const [badgeLocation, setBadgeLocation] = useState(initialData?.badgeLocation || "VELUWE, NETHERLANDS");
  const [latitude, setLatitude] = useState<number>(initialData?.location?.latitude || 52.1326);
  const [longitude, setLongitude] = useState<number>(initialData?.location?.longitude || 5.2913);

  // Tab 5: Media & Status
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [heroBanner, setHeroBanner] = useState(initialData?.heroBanner || "");
  const [gallery, setGallery] = useState<GalleryValues>({
    main: initialData?.gallery?.[0] || "",
    side1: initialData?.gallery?.[1] || "",
    side2: initialData?.gallery?.[2] || "",
    side3: initialData?.gallery?.[3] || "",
  });

  const [status, setStatus] = useState<ParkStatusType>(initialData?.status || "Active");
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? true);

  // Hydrate initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setTitle(initialData.title || "");
      setSubtitle(initialData.subtitle || "");
      setShortDescription(initialData.shortDescription || "");
      setFullDescription(initialData.fullDescription || "");
      setParagraphs(initialData.paragraphs || []);
      setStartingPrice(initialData.startingPrice || 129);
      setCurrency(initialData.currency || "€");
      setTotalProperties(initialData.totalProperties || 24);
      setAvailableProperties(initialData.availableProperties || initialData.totalProperties || 24);
      setTotalCapacity(initialData.totalCapacity || "180 Guests");
      setCheckInTime(initialData.checkInTime || "15:00");
      setCheckOutTime(initialData.checkOutTime || "11:00");
      setReceptionHours(initialData.receptionHours || "24 Hours");
      setRating(initialData.rating || 4.88);
      setReviewsCount(initialData.reviewsCount || 1248);
      setSelectedAmenities(initialData.amenities || []);
      if (initialData.featuredAmenities?.length) {
        setFeaturedAmenities(initialData.featuredAmenities);
      }
      if (initialData.ecoBadge) {
        setEcoTagline(initialData.ecoBadge.tagline || "CERTIFIED ECO-PARK");
        setEcoTitle(initialData.ecoBadge.title || "100% Sustainable Stay");
      }
      if (initialData.location) {
        setCountry(initialData.location.country || "Netherlands");
        setCity(initialData.location.city || "");
        setRegion(initialData.location.region || "");
        setPostalCode(initialData.location.postalCode || "");
        setFormattedAddress(initialData.location.formattedAddress || "");
        if (initialData.location.latitude) setLatitude(initialData.location.latitude);
        if (initialData.location.longitude) setLongitude(initialData.location.longitude);
      }
      setBadgeLocation(initialData.badgeLocation || `${(initialData.location?.region || "Veluwe").toUpperCase()}, ${(initialData.location?.country || "Netherlands").toUpperCase()}`);
      setCoverImage(initialData.coverImage || "");
      setHeroBanner(initialData.heroBanner || "");
      if (initialData.gallery?.length) {
        setGallery({
          main: initialData.gallery[0] || "",
          side1: initialData.gallery[1] || "",
          side2: initialData.gallery[2] || "",
          side3: initialData.gallery[3] || "",
        });
      }
      setStatus(initialData.status || "Active");
      setIsFeatured(initialData.isFeatured ?? true);
    }
  }, [initialData]);

  // Handlers
  const handleAddParagraph = () => {
    if (!newParagraph.trim()) return;
    setParagraphs([...paragraphs, newParagraph.trim()]);
    setNewParagraph("");
  };

  const handleRemoveParagraph = (idx: number) => {
    setParagraphs(paragraphs.filter((_, i) => i !== idx));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!newAmenityName.trim()) return;
    const item = newAmenityName.trim();
    if (!amenitiesList.some((a) => a.id === item)) {
      setAmenitiesList((prev) => [...prev, { id: item, label: item, icon: "✨" }]);
      setSelectedAmenities((prev) => [...prev, item]);
    }
    setNewAmenityName("");
    setShowAddAmenity(false);
  };

  const handleAddFeaturedAmenity = () => {
    if (!newFeatTitle.trim()) return;
    setFeaturedAmenities([
      ...featuredAmenities,
      { title: newFeatTitle.trim(), description: newFeatDesc.trim(), iconName: newFeatIcon },
    ]);
    setNewFeatTitle("");
    setNewFeatDesc("");
  };

  const handleRemoveFeaturedAmenity = (idx: number) => {
    setFeaturedAmenities(featuredAmenities.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (isDraft = false) => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg("Holiday Park Title / Name is required.");
      setActiveTab("basic");
      return;
    }

    try {
      setSubmitting(true);

      const galleryArray = [gallery.main, gallery.side1, gallery.side2, gallery.side3].filter(Boolean);

      const payload: CreateHolidayParkDto | UpdateHolidayParkDto = {
        name: (name || title).trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        badgeLocation: badgeLocation.trim() || `${region.toUpperCase()}, ${country.toUpperCase()}`,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        paragraphs,
        startingPrice: Number(startingPrice) || 129,
        currency,
        totalCapacity,
        totalProperties: Number(totalProperties) || 24,
        availableProperties: Number(availableProperties) || Number(totalProperties) || 24,
        checkInTime,
        checkOutTime,
        receptionHours,
        rating: Number(rating) || 4.88,
        reviewsCount: Number(reviewsCount) || 1248,
        amenities: selectedAmenities,
        featuredAmenities,
        ecoBadge: {
          tagline: ecoTagline.trim(),
          title: ecoTitle.trim(),
        },
        location: {
          country: country.trim(),
          city: city.trim(),
          region: region.trim(),
          postalCode: postalCode.trim(),
          formattedAddress: formattedAddress.trim() || `${city}, ${region}, ${country}`,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        coverImage: coverImage || gallery.main || undefined,
        heroBanner: heroBanner || gallery.main || undefined,
        gallery: galleryArray.length > 0 ? galleryArray : undefined,
        isFeatured,
        status: isDraft ? "Draft" : status,
      };

      if (mode === "edit" && parkId) {
        await updateHolidayPark(parkId, payload);
      } else {
        await createHolidayPark(payload as CreateHolidayParkDto);
      }

      router.push("/dashboard/holiday-parks");
    } catch (err: any) {
      console.error("Save holiday park failed:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to save holiday park details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      active="Holiday Parks"
      title={mode === "add" ? "Create New Holiday Park" : `Edit ${title || "Holiday Park"}`}
      subtitle="Configure luxury resort details, location taxonomy, amenities, and media galleries."
    >
      <main className="p-4 md:p-8 font-sans max-w-6xl mx-auto pb-28 space-y-6">
        {/* Sticky Action Header */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xs sticky top-4 z-40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/holiday-parks"
              className="p-2 rounded-xl text-slate-500 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
              title="Back to Holiday Parks Directory"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3b338c] bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                  {mode === "add" ? "New Park Entry" : "Park Editor"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : status === "Draft"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                >
                  {status}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                {title || (mode === "add" ? "Untitled Holiday Park" : "Edit Park")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-[#3b338c] rounded cursor-pointer"
              />
              <Star size={14} className={isFeatured ? "text-amber-500 fill-amber-400" : "text-slate-400"} />
              <span>Featured Park</span>
            </label>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="h-10 px-4 rounded-xl text-xs font-semibold text-[#3b338c] border border-[#3b338c]/30 hover:bg-[#3b338c]/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="h-10 px-5 rounded-xl text-xs font-bold text-white bg-[#3b338c] hover:bg-[#2d2670] transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{mode === "add" ? "Create Holiday Park" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 p-1">
              <X size={14} />
            </button>
          </div>
        )}

        {/* 5-Segment Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs flex overflow-x-auto gap-1">
          {[
            { id: "basic", label: "1. Basic Details", icon: FileText },
            { id: "specs", label: "2. Specs & Timings", icon: Clock },
            { id: "amenities", label: "3. Amenities & Eco", icon: Sparkles },
            { id: "location", label: "4. Location & Map", icon: MapPin },
            { id: "media", label: "5. Hero & Gallery", icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${isActive
                    ? "bg-[#3b338c] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === "basic" && (
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Basic Park Information</h2>
                <p className="text-xs text-slate-500">Title, descriptions, and branding details.</p>
              </div>
              <span className="text-xs font-semibold text-[#3b338c] bg-violet-50 px-2.5 py-1 rounded-lg">Step 1 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Holiday Park Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!title) setTitle(e.target.value);
                  }}
                  placeholder="e.g. Nordic Pines Retreat"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Public Display Title *</span>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nordic Pines Retreat & Nature Spa"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>
            </div>

            <label className="grid gap-1.5 font-semibold text-slate-800 text-xs">
              <span>Subtitle / Tagline</span>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. LUXURY NATURE RETREAT IN THE HEART OF VELUWE"
                className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
              />
            </label>

            <label className="grid gap-1.5 font-semibold text-slate-800 text-xs">
              <span>Short Summary (Card Preview)</span>
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A high-level summary displayed on listing cards..."
                className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
              />
            </label>

            <RichTextArea
              label="Full Description"
              value={fullDescription}
              onChange={setFullDescription}
              placeholder="Describe the atmosphere, surroundings, and experience..."
            />

            {/* Paragraphs Builder */}
            <div className="space-y-3 pt-2">
              <label className="font-semibold text-slate-800 text-xs block">
                Additional Detailed Paragraphs (For Website Showcase)
              </label>
              <div className="space-y-2">
                {paragraphs.map((p, index) => (
                  <div key={index} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 font-bold mt-0.5">{index + 1}.</span>
                    <p className="text-xs text-slate-700 flex-1 leading-relaxed">{p}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveParagraph(index)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newParagraph}
                  onChange={(e) => setNewParagraph(e.target.value)}
                  placeholder="Add another paragraph detailing amenities or nature activities..."
                  className="flex-1 h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddParagraph}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Paragraph
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className="h-10 px-5 bg-[#3b338c] text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                <span>Next: Specs & Timings</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        )}

        {/* TAB 2: SPECS & TIMINGS */}
        {activeTab === "specs" && (
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Resort Specifications & Operating Hours</h2>
                <p className="text-xs text-slate-500">Pricing, property metrics, rating, and reception hours.</p>
              </div>
              <span className="text-xs font-semibold text-[#3b338c] bg-violet-50 px-2.5 py-1 rounded-lg">Step 2 of 5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CounterInput
                label="Starting Price"
                value={startingPrice}
                onChange={setStartingPrice}
                min={10}
                max={5000}
                step={5}
                unit={currency}
              />
              <CounterInput
                label="Total Managed Properties"
                value={totalProperties}
                onChange={(val) => {
                  setTotalProperties(val);
                  setAvailableProperties(val);
                }}
                min={1}
                max={1000}
              />
              <CounterInput
                label="Available Properties"
                value={availableProperties}
                onChange={setAvailableProperties}
                min={0}
                max={totalProperties}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Total Guest Capacity</span>
                <input
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  placeholder="e.g. 180 Guests"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Rating Score (1.0 - 5.0)</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Total Reviews Count</span>
                <input
                  type="number"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(Number(e.target.value))}
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-800 block">Check-in Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full h-10 px-3.5 pr-9 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] text-xs font-semibold text-slate-800"
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
                    className="w-full h-10 px-3.5 pr-9 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] text-xs font-semibold text-slate-800"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-800 block">Reception Desk Hours</label>
                <select
                  value={receptionHours}
                  onChange={(e) => setReceptionHours(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="24 Hours">24 Hours</option>
                  <option value="08:00 - 22:00">08:00 - 22:00</option>
                  <option value="09:00 - 18:00">09:00 - 18:00</option>
                  <option value="Flexible">Flexible / Self Check-in</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className="h-10 px-5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("amenities")}
                className="h-10 px-5 bg-[#3b338c] text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                <span>Next: Amenities & Eco</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        )}

        {/* TAB 3: AMENITIES & ECO BADGE */}
        {activeTab === "amenities" && (
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Amenities & Sustainability</h2>
                <p className="text-xs text-slate-500">General tags, featured custom amenities, and eco badge details.</p>
              </div>
              <span className="text-xs font-semibold text-[#3b338c] bg-violet-50 px-2.5 py-1 rounded-lg">Step 3 of 5</span>
            </div>

            {/* General Amenities Toggles */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">General Park Amenities</h3>
              <div className="flex flex-wrap items-center gap-2.5">
                {amenitiesList.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${isSelected
                          ? "border-[#3b338c] bg-[#3b338c]/5 text-[#3b338c]"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      <span>{amenity.icon}</span>
                      <span>{amenity.label}</span>
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] ${isSelected ? "border-[#3b338c] bg-[#3b338c] text-white" : "border-slate-300 bg-white"
                          }`}
                      >
                        {isSelected && "✓"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom General Amenity */}
              {showAddAmenity ? (
                <div className="flex items-center gap-2 max-w-sm pt-2">
                  <input
                    type="text"
                    value={newAmenityName}
                    onChange={(e) => setNewAmenityName(e.target.value)}
                    placeholder="New amenity name..."
                    className="h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="h-9 px-3 bg-[#3b338c] text-white text-xs font-semibold rounded-xl"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAmenity(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddAmenity(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#3b338c] text-[#3b338c] text-xs font-bold hover:bg-[#3b338c]/5 transition-colors cursor-pointer mt-2"
                >
                  <Plus size={14} /> Add Custom Tag
                </button>
              )}
            </div>

            {/* Featured Custom Amenities (Rich Cards) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Featured Custom Amenities</h3>
                  <p className="text-xs text-slate-500">Rich amenity highlights displayed on the public park page.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuredAmenities.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-[#3b338c] flex items-center justify-center font-bold text-xs shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.description || "No description provided"}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeaturedAmenity(idx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form to add featured amenity */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <div className="font-semibold text-slate-800">Add Featured Amenity Highlight</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newFeatTitle}
                    onChange={(e) => setNewFeatTitle(e.target.value)}
                    placeholder="Title (e.g. Organic Herbal Sauna)"
                    className="h-9 px-3 border border-slate-200 rounded-lg outline-none bg-white"
                  />
                  <input
                    type="text"
                    value={newFeatDesc}
                    onChange={(e) => setNewFeatDesc(e.target.value)}
                    placeholder="Short Description (e.g. Heated wood saunas)"
                    className="h-9 px-3 border border-slate-200 rounded-lg outline-none bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddFeaturedAmenity}
                  className="h-8 px-3 bg-[#3b338c] text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus size={13} /> Add Featured Amenity
                </button>
              </div>
            </div>

            {/* Sustainable Eco-Badge */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Sustainable Eco-Badge Configuration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label className="grid gap-1.5 font-semibold text-slate-800">
                  <span>Badge Tagline</span>
                  <input
                    value={ecoTagline}
                    onChange={(e) => setEcoTagline(e.target.value)}
                    placeholder="e.g. CERTIFIED ECO-PARK"
                    className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                  />
                </label>

                <label className="grid gap-1.5 font-semibold text-slate-800">
                  <span>Badge Title</span>
                  <input
                    value={ecoTitle}
                    onChange={(e) => setEcoTitle(e.target.value)}
                    placeholder="e.g. 100% Sustainable Stay"
                    className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className="h-10 px-5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("location")}
                className="h-10 px-5 bg-[#3b338c] text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                <span>Next: Location & Map</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        )}

        {/* TAB 4: LOCATION & MAP */}
        {activeTab === "location" && (
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Geographic Address & Map Coordinates</h2>
                <p className="text-xs text-slate-500">Country, region, postal code, and map coordinates inherited by child properties.</p>
              </div>
              <span className="text-xs font-semibold text-[#3b338c] bg-violet-50 px-2.5 py-1 rounded-lg">Step 4 of 5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Country *</span>
                <input
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Netherlands"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>City</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Utrecht"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Region / Province</span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Veluwe"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Postal Code</span>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 3811 AB"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Location Badge String</span>
                <input
                  value={badgeLocation}
                  onChange={(e) => setBadgeLocation(e.target.value)}
                  placeholder="e.g. VELUWE, NETHERLANDS"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Full Formatted Address</span>
                <input
                  value={formattedAddress}
                  onChange={(e) => setFormattedAddress(e.target.value)}
                  placeholder="e.g. Veluwe Forest Way 12, NL"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Latitude Coordinate</span>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  placeholder="52.1326"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>

              <label className="grid gap-1.5 font-semibold text-slate-800">
                <span>Longitude Coordinate</span>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  placeholder="5.2913"
                  className="h-10 px-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#3b338c] bg-white text-slate-800"
                />
              </label>
            </div>

            {/* Interactive Map Visual */}
            <GoogleMapPreview
              locationName={name || title || "Nordic Pines Retreat"}
              city={city}
              country={country}
              formattedAddress={formattedAddress}
              latitude={latitude}
              longitude={longitude}
            />

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("amenities")}
                className="h-10 px-5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className="h-10 px-5 bg-[#3b338c] text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                <span>Next: Hero & Gallery</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        )}

        {/* TAB 5: HERO & MEDIA GALLERY */}
        {activeTab === "media" && (
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Hero & Media Gallery Assets</h2>
                <p className="text-xs text-slate-500">Cover images, hero banners, and multi-photo listing galleries.</p>
              </div>
              <span className="text-xs font-semibold text-[#3b338c] bg-violet-50 px-2.5 py-1 rounded-lg">Step 5 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadBox
                label="Cover Image (Card Preview)"
                hint="Upload image file or paste URL (Recommended: 600×400)"
                value={coverImage}
                onChange={setCoverImage}
                disabled={submitting}
              />

              <ImageUploadBox
                label="Hero Banner Image (Top Showcase)"
                hint="Upload image file or paste URL (Recommended: 1200×600)"
                value={heroBanner}
                onChange={setHeroBanner}
                disabled={submitting}
              />
            </div>

            {/* Gallery Upload Box */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Multi-Image Gallery Stack</h3>
              <MultipleImageUploadBox
                values={gallery}
                onChange={(key, url) => setGallery((prev) => ({ ...prev, [key]: url }))}
                disabled={submitting}
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("location")}
                className="h-10 px-5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="h-11 px-8 rounded-xl font-bold text-white bg-[#3b338c] hover:bg-[#2d2670] transition-colors shadow-md flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Holiday Park...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>{mode === "add" ? "Publish Holiday Park" : "Save Changes"}</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </main>
    </DashboardShell>
  );
}
