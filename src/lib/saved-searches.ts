"use client";

import { useEffect, useState } from "react";
import {
  BODY_LABELS,
  CONDITION_LABELS,
  FUEL_LABELS,
  filterListings,
  type BodyType,
  type Condition,
  type Fuel,
  type Listing,
  type ListingFilters,
  type SortOption,
} from "@/lib/listings";
import { formatPrice } from "@/lib/format";

export type SavedSearch = {
  id: string;
  label: string;
  search: string;
  created_at: string;
};

const STORAGE_KEY = "avto.saved-searches.v1";

function readSaved(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedSearch =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as SavedSearch).id === "string" &&
        typeof (item as SavedSearch).search === "string"
    );
  } catch {
    return [];
  }
}

function persist(items: SavedSearch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("avto:saved-searches-changed"));
}

export function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseSearch(search: string): ListingFilters & { sort?: SortOption } {
  const params = new URLSearchParams(search);
  const condition = params.get("condition");
  const body = params.get("body");
  const fuel = params.get("fuel");
  return {
    q: params.get("q") ?? undefined,
    brand: params.get("brand") ?? undefined,
    city: params.get("city") ?? undefined,
    body: body ?? undefined,
    fuel: fuel ?? undefined,
    transmission: params.get("transmission") ?? undefined,
    condition: condition ?? undefined,
    min: toNumber(params.get("min")),
    max: toNumber(params.get("max")),
    yearFrom: toNumber(params.get("yearFrom")),
    yearTo: toNumber(params.get("yearTo")),
    maxMileage: toNumber(params.get("maxMileage")),
    sort: (params.get("sort") as SortOption) || "newest",
  };
}

export function describeSearch(search: string): string {
  const params = new URLSearchParams(search);
  const parts: string[] = [];

  const q = params.get("q");
  const brand = params.get("brand");
  const city = params.get("city");
  const body = params.get("body") as BodyType | null;
  const fuel = params.get("fuel") as Fuel | null;
  const condition = params.get("condition") as Condition | null;
  const min = params.get("min");
  const max = params.get("max");
  const yearFrom = params.get("yearFrom");
  const yearTo = params.get("yearTo");
  const maxMileage = params.get("maxMileage");

  if (q) parts.push(`«${q}»`);
  if (brand) parts.push(brand);
  if (body && BODY_LABELS[body]) parts.push(BODY_LABELS[body]);
  if (city) parts.push(city);
  if (fuel && FUEL_LABELS[fuel]) parts.push(FUEL_LABELS[fuel]);
  if (condition && CONDITION_LABELS[condition]) parts.push(CONDITION_LABELS[condition]);
  if (min) parts.push(`от ${formatPrice(Number(min))} сум`);
  if (max) parts.push(`до ${formatPrice(Number(max))} сум`);
  if (yearFrom) parts.push(`с ${yearFrom} г.`);
  if (yearTo) parts.push(`по ${yearTo} г.`);
  if (maxMileage) parts.push(`пробег до ${formatPrice(Number(maxMileage))} км`);

  return parts.length > 0 ? parts.join(" · ") : "Все объявления";
}

export function matchesSince(saved: SavedSearch, listings: Listing[]): Listing[] {
  const filters = parseSearch(saved.search);
  return filterListings(
    listings.filter(
      (listing) => listing.published && listing.created_at > saved.created_at
    ),
    filters
  );
}

export function saveSearch(label: string, search: string): SavedSearch | null {
  const normalized = search.startsWith("?") ? search.slice(1) : search;
  const exists = readSaved().find((item) => item.search === normalized);
  if (exists) return exists;

  const item: SavedSearch = {
    id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    label: label.trim() || describeSearch(normalized),
    search: normalized,
    created_at: new Date().toISOString(),
  };
  persist([item, ...readSaved()]);
  return item;
}

export function removeSavedSearch(id: string): void {
  persist(readSaved().filter((item) => item.id !== id));
}

export function isSearchSaved(search: string): boolean {
  const normalized = search.startsWith("?") ? search.slice(1) : search;
  return readSaved().some((item) => item.search === normalized);
}

export function useSavedSearches(): {
  items: SavedSearch[];
  ready: boolean;
  save: (label: string, search: string) => SavedSearch | null;
  remove: (id: string) => void;
} {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setItems(readSaved());
      setReady(true);
    };
    sync();
    window.addEventListener("avto:saved-searches-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:saved-searches-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { items, ready, save: saveSearch, remove: removeSavedSearch };
}
