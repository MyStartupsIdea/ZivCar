"use client";

// Remote (Supabase) storage for listings. The local store in `listings.ts`
// stays the cache and the offline fallback; this module only moves rows.
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type {
  BodyType,
  Condition,
  Drive,
  Fuel,
  Listing,
  Transmission,
} from "@/lib/listings";

type ListingRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
  condition: string;
  fuel: string | null;
  transmission: string | null;
  body: string | null;
  drive: string | null;
  color: string | null;
  engine: number | null;
  owners: number | null;
  negotiable: boolean;
  exchange: boolean;
  phone: string;
  photos: string[];
  seller_id: string;
  sold_at: string | null;
  created_at: string;
  published: boolean;
  views: number;
};

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    price: Number(row.price),
    city: row.city ?? "",
    brand: row.brand ?? "",
    model: row.model ?? "",
    year: row.year,
    mileage: row.mileage === null ? null : Number(row.mileage),
    condition: (row.condition ?? "used") as Condition,
    fuel: (row.fuel ?? null) as Fuel | null,
    transmission: (row.transmission ?? null) as Transmission | null,
    body: (row.body ?? null) as BodyType | null,
    drive: (row.drive ?? null) as Drive | null,
    color: row.color,
    engine: row.engine === null ? null : Number(row.engine),
    owners: row.owners,
    negotiable: row.negotiable,
    exchange: row.exchange,
    phone: row.phone ?? "",
    photos: Array.isArray(row.photos) ? row.photos : [],
    sellerId: row.seller_id,
    sold_at: row.sold_at,
    created_at: row.created_at,
    published: row.published,
    views: row.views ?? 0,
  };
}

function listingToRow(listing: Listing): ListingRow {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    city: listing.city,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    condition: listing.condition,
    fuel: listing.fuel,
    transmission: listing.transmission,
    body: listing.body,
    drive: listing.drive,
    color: listing.color,
    engine: listing.engine,
    owners: listing.owners,
    negotiable: listing.negotiable,
    exchange: listing.exchange,
    phone: listing.phone,
    photos: listing.photos,
    seller_id: listing.sellerId,
    sold_at: listing.sold_at,
    created_at: listing.created_at,
    published: listing.published,
    views: listing.views,
  };
}

/** Reads every listing from Supabase, or null when the backend is unavailable. */
export async function fetchRemoteListings(): Promise<Listing[] | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data, error } = await client
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[supabase] не удалось прочитать объявления:", error.message);
    return null;
  }

  return (data as ListingRow[] | null)?.map(rowToListing) ?? [];
}

/** Inserts or updates a single listing. */
export async function pushListing(listing: Listing): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) return false;

  const { error } = await client
    .from("listings")
    .upsert(listingToRow(listing), { onConflict: "id" });

  if (error) {
    console.warn("[supabase] не удалось сохранить объявление:", error.message);
    return false;
  }
  return true;
}

/** Inserts or updates many listings (used for the first-run seed). */
export async function pushListings(listings: Listing[]): Promise<boolean> {
  if (listings.length === 0) return true;
  const client = getSupabaseBrowserClient();
  if (!client) return false;

  const { error } = await client
    .from("listings")
    .upsert(listings.map(listingToRow), { onConflict: "id" });

  if (error) {
    console.warn("[supabase] не удалось заполнить таблицу:", error.message);
    return false;
  }
  return true;
}

/** Deletes a listing in Supabase. */
export async function deleteRemoteListing(id: string): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) return false;

  const { error } = await client.from("listings").delete().eq("id", id);
  if (error) {
    console.warn("[supabase] не удалось удалить объявление:", error.message);
    return false;
  }
  return true;
}
