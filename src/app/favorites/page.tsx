"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { useFavorites, useListings } from "@/lib/listings";

export default function FavoritesPage() {
  const { ids, ready } = useFavorites();
  const { listings, ready: listingsReady } = useListings();
  const saved = listings.filter((listing) => ids.includes(listing.id) && listing.published);
  const loading = !ready || !listingsReady;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10">
      <h1 className="text-[26px] font-semibold tracking-tight sm:text-[32px]">Избранное</h1>
      <p className="mt-1 text-[13px] text-zinc-500">
        {loading
          ? "Загрузка…"
          : `${saved.length} ${saved.length === 1 ? "объявление" : "объявлений"}`}
      </p>

      {!loading && saved.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <Heart className="h-5 w-5" />
          </span>
          <p className="mt-4 text-[15px] font-medium">Здесь появятся сохранённые авто</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">
            Нажмите на сердечко в карточке, чтобы сохранить объявление.
          </p>
          <Link
            href="/search"
            className="mt-5 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Открыть каталог
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
          {saved.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
