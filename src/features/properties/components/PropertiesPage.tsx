"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Home,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import {
  deleteProperty,
  fetchAdminProperties,
  fetchPropertyById,
  fetchPropertyStats,
  updateProperty,
} from "../api/properties.api";
import {
  Property,
  PropertyCategory,
  PropertyStats,
  PropertyStatus,
  UpdatePropertyDto,
} from "../types/properties.types";
import { PropertiesTableSkeleton } from "./PropertiesTableSkeleton";
import { PropertiesStatSkeleton } from "./PropertiesStatSkeleton";

const categories: PropertyCategory[] = [
  "Lakefront",
  "Cabins & Lodges",
  "Wellness Villas",
];
const statuses: PropertyStatus[] = ["Active", "Draft", "Archived"];

type PropertyForm = Pick<
  UpdatePropertyDto,
  | "title"
  | "category"
  | "location"
  | "country"
  | "description"
  | "pricePerNight"
  | "guests"
  | "beds"
  | "baths"
  | "size"
  | "status"
  | "isPopular"
>;

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string") return message;
    if (error.response?.status === 401 || error.response?.status === 403)
      return "Your session has expired. Please log in again.";
    if (error.response?.status === 404) return "This property no longer exists.";
  }
  return error instanceof Error ? error.message : fallback;
}

function formFromProperty(property: Property): PropertyForm {
  return {
    title: property.title,
    category: property.category,
    location: property.location,
    country: property.country,
    description: property.description,
    pricePerNight: property.pricePerNight,
    guests: property.guests,
    beds: property.beds,
    baths: property.baths,
    size: property.size,
    status: property.status,
    isPopular: property.isPopular,
  };
}

function formatPrice(value: number, currency: string) {
  return `${currency || "€"}${new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function PropertiesPage() {
  const router = useRouter();

  // Filter & Pagination States
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<"All" | PropertyCategory>("All");
  const [status, setStatus] = useState<"All" | PropertyStatus>("All");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data States
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<PropertyStats | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [form, setForm] = useState<PropertyForm | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);

  // Action Loading States
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminProperties({
        search: debouncedSearch || undefined,
        category: category === "All" ? undefined : category,
        status: status === "All" ? undefined : status,
        page,
        limit: 10,
      });
      setProperties(response.items);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (loadError) {
      setProperties([]);
      setTotalItems(0);
      setTotalPages(1);
      setError(getErrorMessage(loadError, "Unable to load properties. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [category, page, debouncedSearch, status]);

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      setStats(await fetchPropertyStats());
    } catch {
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties, refreshKey]);

  useEffect(() => {
    void loadStats();
  }, [loadStats, refreshKey]);

  const rangeLabel = useMemo(() => {
    if (totalItems === 0) return "No properties";
    const first = (page - 1) * 10 + 1;
    return `${first}–${Math.min(page * 10, totalItems)} of ${totalItems} properties`;
  }, [page, totalItems]);

  async function openDetails(id: string) {
    setIsDetailsLoading(true);
    setError(null);
    try {
      setSelectedProperty(await fetchPropertyById(id));
    } catch (detailsError) {
      setError(getErrorMessage(detailsError, "Unable to load this property."));
    } finally {
      setIsDetailsLoading(false);
    }
  }

  function openQuickEdit(property: Property) {
    setEditingProperty(property);
    setForm(formFromProperty(property));
  }

  async function saveQuickEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProperty || !form) return;
    if (
      !form.title?.trim() ||
      form.pricePerNight === undefined ||
      !Number.isFinite(form.pricePerNight) ||
      form.pricePerNight < 0
    ) {
      setError("Enter a property title and a valid non-negative nightly price.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateProperty(editingProperty._id, {
        ...form,
        title: form.title.trim(),
        location: form.location?.trim(),
        country: form.country?.trim(),
        description: form.description?.trim(),
      });
      setProperties((current) =>
        current.map((property) => (property._id === updated._id ? updated : property))
      );
      setEditingProperty(null);
      setForm(null);
      setRefreshKey((key) => key + 1);
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Unable to update the property."));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete._id);
    setError(null);
    try {
      await deleteProperty(pendingDelete._id);
      setPendingDelete(null);
      if (properties.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete the property."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      active="Properties"
      title="Properties"
      subtitle="Manage holiday homes, availability, and listing details."
    >
      <main className="space-y-5 p-5 md:p-8">
        {/* Statistics Cards */}
        {isStatsLoading ? (
          <PropertiesStatSkeleton />
        ) : (
          <section
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Property statistics"
          >
            <StatCard
              label="All properties"
              value={stats?.total}
              icon={<Home className="h-5 w-5" />}
              tone="violet"
            />
            <StatCard
              label="Active listings"
              value={stats?.active}
              icon={<Star className="h-5 w-5" />}
              tone="emerald"
            />
            <StatCard
              label="Drafts"
              value={stats?.draft}
              icon={<Pencil className="h-5 w-5" />}
              tone="amber"
            />
            <StatCard
              label="Archived"
              value={stats?.archived}
              icon={<Trash2 className="h-5 w-5" />}
              tone="slate"
            />
          </section>
        )}

        {/* Filter & Action Controls */}
        <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px_150px]">
            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-500 focus-within:border-[#3b338c] focus-within:ring-1 focus-within:ring-[#3b338c]">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Search properties</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title, location, or park..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as "All" | PropertyCategory);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#3b338c] focus:ring-1 focus:ring-[#3b338c]"
            >
              <option value="All">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "All" | PropertyStatus);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#3b338c] focus:ring-1 focus:ring-[#3b338c]"
            >
              <option value="All">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/dashboard/properties/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#3b338c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f296d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b338c] focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add property
          </Link>
        </section>

        {/* Global Error Banner */}
        {error ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError(null)}
              className="rounded p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* Properties Data Table */}
        <section
          className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs"
          aria-label="Properties list"
        >
          {isLoading ? (
            <PropertiesTableSkeleton rows={6} />
          ) : properties.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Home className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
              <h2 className="mt-3 font-semibold text-slate-800">No properties found</h2>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your search criteria or create a new property listing.
              </p>
            </div>
          ) : (
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Capacity</th>
                  <th className="px-5 py-3 font-semibold">Nightly rate</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((property) => (
                  <tr key={property._id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <PropertyImage property={property} />
                        <div className="min-w-0">
                          <p className="max-w-52 truncate font-semibold text-slate-900">
                            {property.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">{property.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-52 items-center gap-1.5 text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="truncate">
                          {property.location || property.country || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        {property.guests}
                      </span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        {property.beds}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#3b338c]">
                      {formatPrice(property.pricePerNight, property.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={property.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <ActionButton
                          label="View property details"
                          onClick={() => void openDetails(property._id)}
                          disabled={isDetailsLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton
                          label="Edit property"
                          onClick={() => router.push(`/dashboard/properties/${property._id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton
                          label="Delete property"
                          destructive
                          onClick={() => setPendingDelete(property)}
                          disabled={deletingId === property._id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Pagination Navigation */}
        <nav
          aria-label="Properties pagination"
          className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{rangeLabel}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((current) => current - 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </main>

      {/* Modal Dialogs */}
      {selectedProperty ? (
        <PropertyDetailsDialog
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={() => {
            const id = selectedProperty._id;
            setSelectedProperty(null);
            router.push(`/dashboard/properties/${id}/edit`);
          }}
        />
      ) : null}

      {editingProperty && form ? (
        <EditPropertyDialog
          form={form}
          isSaving={isSaving}
          onChange={setForm}
          onClose={() => {
            setEditingProperty(null);
            setForm(null);
          }}
          onSubmit={saveQuickEdit}
        />
      ) : null}

      {pendingDelete ? (
        <DeletePropertyDialog
          property={pendingDelete}
          isDeleting={deletingId === pendingDelete._id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </DashboardShell>
  );
}

// Subcomponents
function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value?: number;
  icon: React.ReactNode;
  tone: "violet" | "emerald" | "amber" | "slate";
}) {
  const colors = {
    violet: "bg-violet-50 text-[#3b338c]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value !== undefined ? value : "N/A"}
          </p>
        </div>
        <span className={`rounded-lg p-2 ${colors[tone]}`}>{icon}</span>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: PropertyStatus }) {
  const colors = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Draft: "border-amber-200 bg-amber-50 text-amber-700",
    Archived: "border-slate-200 bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
}

function PropertyImage({ property }: { property: Property }) {
  return property.gallery?.main ? (
    <img
      src={property.gallery.main}
      alt=""
      className="h-12 w-14 rounded-md border border-slate-200 object-cover"
    />
  ) : (
    <div className="grid h-12 w-14 place-items-center rounded-md bg-slate-100 text-slate-400">
      <Home className="h-5 w-5" aria-hidden="true" />
    </div>
  );
}

function ActionButton({
  label,
  children,
  onClick,
  disabled,
  destructive = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-10 w-10 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b338c] disabled:cursor-not-allowed disabled:opacity-50 ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-violet-50 hover:text-[#3b338c]"
      }`}
    >
      {children}
    </button>
  );
}

function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b338c]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function PropertyDetailsDialog({
  property,
  onClose,
  onEdit,
}: {
  property: Property;
  onClose: () => void;
  onEdit: () => void;
}) {
  const parkName =
    typeof property.holidayPark === "object" && property.holidayPark !== null
      ? property.holidayPark.title || property.holidayPark.name
      : property.holidayParkName;

  const sidePhotos = [
    property.gallery?.side1,
    property.gallery?.side2,
    property.gallery?.side3,
  ].filter(Boolean) as string[];

  return (
    <Dialog title="Property Details" onClose={onClose}>
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <PropertyImage property={property} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#3b338c] uppercase tracking-wide">
                {property.badge || property.category}
              </span>
              {property.isPopular && (
                <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  POPULAR
                </span>
              )}
            </div>
            <p className="mt-1 text-xl font-bold text-slate-900">{property.title}</p>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {property.location || property.country || "Location not specified"}
              {parkName ? ` · ${parkName}` : ""}
            </p>
            <div className="mt-3">
              <StatusBadge status={property.status} />
            </div>
          </div>
        </div>

        {/* Key Specifications Grid */}
        <dl className="grid gap-4 border-y border-slate-100 py-4 sm:grid-cols-4">
          <Detail
            label="Nightly Rate"
            value={formatPrice(property.pricePerNight, property.currency)}
          />
          <Detail
            label="Capacity"
            value={`${property.guests} Guests · ${property.beds} Beds`}
          />
          <Detail label="Bathrooms" value={`${property.baths || 1} Baths`} />
          <Detail label="Property Size" value={property.size || "N/A"} />
        </dl>

        {/* Gallery Showcase */}
        {sidePhotos.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Gallery Photos
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sidePhotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Gallery ${i + 1}`}
                  className="h-20 w-full rounded-md border border-slate-200 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Fee Breakdown */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Pricing & Fee Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
            <div>
              <span className="text-slate-500 block">Base Price</span>
              <span className="font-semibold text-slate-800">
                {formatPrice(property.pricePerNight, property.currency)} / night
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Cleaning Fee</span>
              <span className="font-semibold text-slate-800">
                €{property.cleaningFee ?? 80}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Taxes & Service</span>
              <span className="font-semibold text-slate-800">
                €{property.taxes ?? 45}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Description
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {property.description || "No description provided."}
          </p>
        </div>

        {/* Action Footer */}
        <footer className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="h-10 rounded-lg bg-[#3b338c] px-4 text-sm font-semibold text-white hover:bg-[#2f296d] flex items-center gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            Edit Full Listing
          </button>
        </footer>
      </div>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function EditPropertyDialog({
  form,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}: {
  form: PropertyForm;
  isSaving: boolean;
  onChange: React.Dispatch<React.SetStateAction<PropertyForm | null>>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  const update = <K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) =>
    onChange((current) => (current ? { ...current, [key]: value } : current));
  return (
    <Dialog title="Quick Edit Property" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input
              required
              value={form.title ?? ""}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(event) => update("category", event.target.value as PropertyCategory)}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input
              value={form.location ?? ""}
              onChange={(event) => update("location", event.target.value)}
            />
          </Field>
          <Field label="Country">
            <input
              value={form.country ?? ""}
              onChange={(event) => update("country", event.target.value)}
            />
          </Field>
          <Field label="Price per night (€)">
            <input
              type="number"
              min="0"
              step="1"
              required
              value={form.pricePerNight ?? 0}
              onChange={(event) => update("pricePerNight", Number(event.target.value))}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(event) => update("status", event.target.value as PropertyStatus)}
            >
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Guests">
            <input
              type="number"
              min="0"
              value={form.guests ?? 0}
              onChange={(event) => update("guests", Number(event.target.value))}
            />
          </Field>
          <Field label="Beds">
            <input
              type="number"
              min="0"
              value={form.beds ?? 0}
              onChange={(event) => update("beds", Number(event.target.value))}
            />
          </Field>
          <Field label="Baths">
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.baths ?? 0}
              onChange={(event) => update("baths", Number(event.target.value))}
            />
          </Field>
          <Field label="Size">
            <input
              value={form.size ?? ""}
              onChange={(event) => update("size", event.target.value)}
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(event) => update("description", event.target.value)}
          />
        </Field>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isPopular ?? false}
            onChange={(event) => update("isPopular", event.target.checked)}
            className="h-4 w-4 rounded accent-[#3b338c]"
          />
          Show in popular properties
        </label>
        <footer className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-10 rounded-lg bg-[#3b338c] px-4 text-sm font-semibold text-white hover:bg-[#2f296d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700 [&>input]:h-10 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-slate-200 [&>input]:px-3 [&>input]:text-slate-900 [&>input]:outline-none [&>input:focus]:border-[#3b338c] [&>select]:h-10 [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-slate-200 [&>select]:px-3 [&>select]:text-slate-900 [&>select]:outline-none [&>select:focus]:border-[#3b338c] [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-slate-200 [&>textarea]:p-3 [&>textarea]:text-slate-900 [&>textarea]:outline-none [&>textarea:focus]:border-[#3b338c]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function DeletePropertyDialog({
  property,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  property: Property;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog title="Delete Property" onClose={onCancel}>
      <div className="p-5">
        <p className="text-sm leading-6 text-slate-600">
          Are you sure you want to delete <strong>{property.title}</strong>? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete Property"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
