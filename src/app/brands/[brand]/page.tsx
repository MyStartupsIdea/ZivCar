"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { useListings, type Listing } from "@/lib/listings";
import { median } from "@/lib/analytics";
import { formatMileage, formatPrice } from "@/lib/format";

function BrandView() {
  const params = useParams<{ brand: string }>();
  const brand = decodeURIComponent(typeof params.brand === "string" ? params.brand : "");
  const { listings, ready } = useListings();

  const own = listings.filter(
    (listing) => listing.published && listing.brand.toLowerCase() === brand.toLowerCase()
  );
  const prices = own.map((listing) => listing.price).filter((price) => price > 0);
  const years = own.map((listing) => listing.year).filter((year): year is number => Boolean(year));
  const mileages = own
    .map((listing) => listing.mileage)
    .filter((mileage): mileage is number => mileage != null);

  const stats = [
    { label: "В продаже", value: String(own.length) },
    { label: "Медианная цена", value: prices.length > 0 ? `${formatPrice(median(prices))} сум` : "—" },
    {
      label: "Цена от",
      value: prices.length > 0 ? `${formatPrice(Math.min(...prices))} сум` : "—",
    },
    {
      label: "Годы",
      value:
        years.length > 0 ? `${Math.min(...years)}–${Math.max(...years)}` : "—",
    },
    {
      label: "Средний пробег",
      value:
        mileages.length > 0
          ? formatMileage(Math.round(mileages.reduce((sum, value) => sum + value, 0) / mileages.length))
          : "—",
    },
    { label: "Городов", value: String(new Set(own.map((item) => item.city)).size) },
  ];

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="h-10 w-52 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      </div>
    );
  }

  if (own.length === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Для марки «{brand}» пока нет объявлений</p>
        <p className="mt-1 text-sm text-zinc-500">
          Посмотрите весь каталог или разместите первую карточку.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/search"
            className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Весь каталог
          </Link>
          <Link
            href="/new"
            className="inline-flex rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium"
          >
            Разместить
          </Link>
        </div>
      </div>
    );
  }

  const cheapest = [...own].sort((a, b) => a.price - b.price)[0] as Listing | undefined;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-8">
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Каталог
      </Link>

      <h1 className="mt-4 text-[28px] font-semibold tracking-tight sm:text-[36px]">{brand}</h1>
      <p className="mt-1 text-[13px] text-zinc-500">
        {own.length} объявлений · медиана {prices.length > 0 ? `${formatPrice(median(prices))} сум` : "—"}
        {cheapest ? ` · от ${formatPrice(cheapest.price)} сум` : ""}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-zinc-50 px-4 py-3">
            <dt className="text-[11px] uppercase tracking-[0.1em] text-zinc-400">{stat.label}</dt>
            <dd className="mt-0.5 text-[15px] font-semibold leading-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Все {brand} в продаже</h2>
        <Link
          href={`/search?brand=${encodeURIComponent(brand)}`}
          className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Фильтры каталога
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
        {own.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-6xl px-5 py-16 text-sm text-zinc-400">Загрузка…</div>}
    >
      <BrandView />
    </Suspense>
  );
}
