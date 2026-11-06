"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { useCurrentAccount } from "@/lib/accounts";
import { useListings } from "@/lib/listings";
import { getReviews, ratingSummary } from "@/lib/reviews";
import { formatDate } from "@/lib/format";

const FILTERS = [
  { key: "all", label: "Все" },
  { key: "private", label: "Частные" },
  { key: "dealer", label: "Салоны" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function DealersPage() {
  const { accounts, ready, account: current } = useCurrentAccount();
  const { listings, ready: listingsReady } = useListings();
  const [filter, setFilter] = useState<FilterKey>("all");

  const rows = useMemo(() => {
    return accounts
      .map((account) => {
        const own = listings.filter((listing) => listing.sellerId === account.id);
        return {
          account,
          active: own.filter((listing) => listing.published).length,
          total: own.length,
          rating: listingsReady ? ratingSummary(getReviews(account.id)) : { average: 0, count: 0 },
        };
      })
      .filter((row) => filter === "all" || row.account.type === filter)
      .sort((a, b) => b.active - a.active || b.rating.average - a.rating.average);
  }, [accounts, listings, listingsReady, filter]);

  const loading = !ready || !listingsReady;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">Продавцы</p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-tight sm:text-[32px]">
        Кто продаёт на площадке
      </h1>
      <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-zinc-500">
        Частные владельцы и автосалоны Узбекистана. У каждого — активные объявления, рейтинг и
        публичный профиль с отзывами.
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              filter === item.key
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center text-[13px] text-zinc-500">
          В этой категории пока нет продавцов.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map(({ account, active, total, rating }) => (
            <li
              key={account.id}
              className="rounded-2xl border border-zinc-200 p-5 transition-colors hover:border-zinc-300"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[16px] font-semibold"
                  style={{
                    backgroundColor: `hsl(${account.hue} 65% 93%)`,
                    color: `hsl(${account.hue} 45% 32%)`,
                  }}
                >
                  {account.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-[15px] font-medium">
                    <Link href={`/sellers/${account.id}`} className="transition-colors hover:text-zinc-600">
                      {account.name}
                    </Link>
                    {account.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-zinc-400" />}
                    {current?.id === account.id && (
                      <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                        вы
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-zinc-500">
                    {account.type === "dealer" ? "Автосалон" : "Частное лицо"} · {account.city} · с{" "}
                    {formatDate(account.joined_at)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-zinc-900 text-zinc-900" />
                      {rating.count > 0 ? `${rating.average.toFixed(1)} (${rating.count})` : "нет отзывов"}
                    </span>
                    <span>{active} в продаже</span>
                    <span>{total} всего</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                {account.bio}
              </p>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/sellers/${account.id}`}
                  className="rounded-full border border-zinc-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-zinc-300"
                >
                  Объявления и отзывы
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
