"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, Star } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { ReviewForm } from "@/components/ReviewForm";
import { useCurrentAccount } from "@/lib/accounts";
import { listingsBySeller, useListings } from "@/lib/listings";
import { useReviews } from "@/lib/reviews";
import { formatDate, timeAgo } from "@/lib/format";

function SellerView() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const { account: current, accounts, ready } = useCurrentAccount();
  const { listings, ready: listingsReady } = useListings();
  const { reviews, summary } = useReviews(id);

  const seller = accounts.find((item) => item.id === id);
  const own = listingsBySeller(listings, id);
  const active = own.filter((listing) => listing.published);
  const sold = own.filter((listing) => !listing.published && listing.sold_at);
  const views = own.reduce((sum, listing) => sum + listing.views, 0);

  if (!ready || !listingsReady) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Продавец не найден</p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-10">
      <div className="flex flex-wrap items-start gap-4">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-[24px] font-semibold"
          style={{
            backgroundColor: `hsl(${seller.hue} 65% 93%)`,
            color: `hsl(${seller.hue} 45% 32%)`,
          }}
        >
          {seller.name.slice(0, 1).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-[24px] font-semibold tracking-tight sm:text-[28px]">
            {seller.name}
            {seller.verified && <BadgeCheck className="h-5 w-5 text-zinc-500" />}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {seller.type === "dealer" ? "Автосалон" : "Частное лицо"} · {seller.city} · на сайте с{" "}
            {formatDate(seller.joined_at)}
          </p>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-zinc-600">{seller.bio}</p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 px-4 py-3">
          <Star className="h-4 w-4 fill-zinc-900 text-zinc-900" />
          <span className="text-[16px] font-semibold">
            {summary.count > 0 ? summary.average.toFixed(1) : "—"}
          </span>
          <span className="text-[12px] text-zinc-400">({summary.count})</span>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "В продаже", value: String(active.length) },
          { label: "Продано", value: String(sold.length) },
          { label: "Просмотры", value: String(views) },
          { label: "Отзывы", value: String(summary.count) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-zinc-50 px-4 py-3">
            <dt className="text-[11px] uppercase tracking-[0.1em] text-zinc-400">{stat.label}</dt>
            <dd className="mt-0.5 text-[18px] font-semibold tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {current?.id === seller.id && (
        <p className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-[13px] text-zinc-600">
          Это ваш профиль.{" "}
          <Link href="/my" className="underline underline-offset-4">
            Управлять объявлениями
          </Link>
        </p>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Объявления</h2>
          <span className="text-[12px] text-zinc-400">{active.length} активных</span>
        </div>

        {active.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-[13px] text-zinc-500">
            Сейчас нет активных объявлений.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-3">
            {active.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-zinc-200/80 pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Отзывы</h2>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-[13px] text-zinc-500">
                Отзывов пока нет.
              </p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium">{review.authorName}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`h-3.5 w-3.5 ${
                            value <= review.rating
                              ? "fill-zinc-900 text-zinc-900"
                              : "text-zinc-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{review.text}</p>
                  <p className="mt-2 text-[11px] text-zinc-400">{timeAgo(review.created_at)}</p>
                </article>
              ))
            )}
          </div>

          <div>
            <ReviewForm sellerId={seller.id} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SellerPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-4xl px-5 py-16 text-sm text-zinc-400">Загрузка…</div>}
    >
      <SellerView />
    </Suspense>
  );
}
