"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { useListings, type Listing } from "@/lib/listings";
import { useRecent } from "@/lib/recently-viewed";

export default function HistoryPage() {
  const { ids, ready, clear } = useRecent();
  const { listings, ready: listingsReady } = useListings();

  const viewed = ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is Listing => Boolean(listing));

  const loading = !ready || !listingsReady;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight sm:text-[32px]">
            Вы смотрели
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {loading
              ? "Загрузка…"
              : `${viewed.length} ${viewed.length === 1 ? "объявление" : "объявлений"} в истории`}
          </p>
        </div>
        {viewed.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="rounded-full border border-zinc-200 px-4 py-2 text-[13px] transition-colors hover:border-zinc-300"
          >
            Очистить историю
          </button>
        )}
      </div>

      {!loading && viewed.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <Clock className="mx-auto h-6 w-6 text-zinc-300" />
          <p className="mt-3 text-[15px] font-medium">История пока пуста</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">
            Открывайте карточки — они появятся здесь, чтобы можно было вернуться.
          </p>
          <Link
            href="/search"
            className="mt-5 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Открыть каталог
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
          {viewed.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
