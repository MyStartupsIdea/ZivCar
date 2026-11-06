"use client";

import Link from "next/link";
import { Bell, Search, Trash2 } from "lucide-react";
import { describeSearch, matchesSince, useSavedSearches } from "@/lib/saved-searches";
import { useListings } from "@/lib/listings";
import { timeAgo } from "@/lib/format";

export default function SavedSearchesPage() {
  const { items, ready, remove } = useSavedSearches();
  const { listings, ready: listingsReady } = useListings();

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-10">
      <h1 className="text-[26px] font-semibold tracking-tight sm:text-[32px]">Сохранённые поиски</h1>
      <p className="mt-1 text-[13px] text-zinc-500">
        Подписки на фильтры каталога: показываем, сколько новых объявлений появилось после сохранения.
      </p>

      {!ready || !listingsReady ? (
        <div className="mt-8 space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <Bell className="mx-auto h-6 w-6 text-zinc-300" />
          <p className="mt-3 text-[15px] font-medium">Пока нет сохранённых поисков</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
            Настройте фильтры в каталоге и нажмите «Сохранить поиск» — вернётесь к подборке в один клик.
          </p>
          <Link
            href="/search"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            <Search className="h-4 w-4" />
            Открыть каталог
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => {
            const fresh = matchesSince(item, listings);
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/search?${item.search}`}
                      className="text-[15px] font-medium transition-colors hover:text-zinc-600"
                    >
                      {item.label}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-zinc-500">{describeSearch(item.search)}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px]">
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          fresh.length > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {fresh.length > 0
                          ? `${fresh.length} новых после сохранения`
                          : "новых пока нет"}
                      </span>
                      <span className="text-zinc-400">сохранено {timeAgo(item.created_at)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Удалить сохранённый поиск"
                    className="shrink-0 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {fresh.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
                    {fresh.slice(0, 3).map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/ads/${listing.id}`}
                        className="rounded-full bg-zinc-50 px-3 py-1 text-[12px] text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        {listing.title}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
