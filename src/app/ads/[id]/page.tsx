"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Eye, Phone, Share2 } from "lucide-react";
import { CarArt } from "@/components/CarArt";
import { CompareToggle } from "@/components/CompareToggle";
import { CreditCalculator } from "@/components/CreditCalculator";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ListingCard } from "@/components/ListingCard";
import { MessageSellerButton } from "@/components/MessageSellerButton";
import { SellerCard } from "@/components/SellerCard";
import { priceIndex } from "@/lib/analytics";
import { trackView } from "@/lib/recently-viewed";
import {
  BODY_LABELS,
  CONDITION_LABELS,
  DRIVE_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  incrementViews,
  similarListings,
  useListing,
  useListings,
} from "@/lib/listings";
import { formatMileage, formatPhone, formatPrice, timeAgo } from "@/lib/format";

function DetailContent() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const { listing, ready } = useListing(id);
  const { listings } = useListings();
  const [activePhoto, setActivePhoto] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (listing && !tracked.current) {
      tracked.current = true;
      incrementViews(listing.id);
      trackView(listing.id);
    }
  }, [listing]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Объявление не найдено</p>
        <p className="mt-1 text-sm text-zinc-500">Возможно, его сняли с публикации или удалили.</p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  const specs = [
    { label: "Год выпуска", value: listing.year ? String(listing.year) : "—" },
    { label: "Пробег", value: formatMileage(listing.mileage) ?? "—" },
    { label: "Кузов", value: listing.body ? BODY_LABELS[listing.body] : "—" },
    { label: "Двигатель", value: listing.engine ? `${listing.engine} л` : "—" },
    { label: "Топливо", value: listing.fuel ? FUEL_LABELS[listing.fuel] : "—" },
    {
      label: "Коробка",
      value: listing.transmission ? TRANSMISSION_LABELS[listing.transmission] : "—",
    },
    { label: "Привод", value: listing.drive ? DRIVE_LABELS[listing.drive] : "—" },
    { label: "Цвет", value: listing.color ?? "—" },
    { label: "Владельцев", value: listing.owners ? String(listing.owners) : "—" },
    { label: "Город", value: listing.city },
  ];

  const similar = similarListings(
    listing,
    listings.filter((item) => item.published)
  );

  const market = priceIndex(listing, listings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: listing.title,
    description: listing.description,
    brand: { "@type": "Brand", name: listing.brand },
    model: listing.model,
    vehicleModelDate: listing.year ? String(listing.year) : undefined,
    mileageFromOdometer: listing.mileage
      ? { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "KMT" }
      : undefined,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "UZS",
      availability: "https://schema.org/InStock",
    },
    numberOfDoors: undefined,
  };

  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: listing?.title ?? "avto.uz", url });
        return;
      } catch {
        // пользователь отменил — просто копируем ссылку
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="mx-auto max-w-6xl px-5 pb-20 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-zinc-400" aria-label="Хлебные крошки">
        <Link href="/" className="transition-colors hover:text-zinc-900">
          Главная
        </Link>
        <span>/</span>
        <Link href="/search" className="transition-colors hover:text-zinc-900">
          Каталог
        </Link>
        <span>/</span>
        <Link
          href={`/search?brand=${encodeURIComponent(listing.brand)}`}
          className="transition-colors hover:text-zinc-900"
        >
          {listing.brand}
        </Link>
        <span>/</span>
        <span className="truncate text-zinc-500">{listing.title}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl bg-zinc-100">
            <div className="relative aspect-[16/10]">
              {listing.photos[activePhoto] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.photos[activePhoto]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <CarArt seed={listing.id} label={listing.title} className="h-full w-full" />
              )}
              <FavoriteButton id={listing.id} size="lg" className="absolute right-3 top-3" />
            </div>
          </div>

          {listing.photos.length > 1 && (
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
              {listing.photos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  aria-label={`Фото ${index + 1}`}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activePhoto === index
                      ? "border-zinc-900"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-400">
              Описание
            </h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-zinc-700">
              {listing.description}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-400">
              Характеристики
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="border-b border-zinc-100 pb-2">
                  <dt className="text-[12px] text-zinc-400">{spec.label}</dt>
                  <dd className="text-[14px] font-medium text-zinc-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-zinc-200 p-5">
            <p className="text-[26px] font-semibold tracking-tight">
              {formatPrice(listing.price)}
              <span className="ml-1 text-base font-normal text-zinc-400">сум</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-zinc-500">
              {listing.negotiable && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5">Торг возможен</span>
              )}
              {listing.exchange && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5">Обмен</span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {listing.views}
              </span>
            </div>

            <h1 className="mt-4 text-[20px] font-semibold leading-snug tracking-tight">
              {listing.title}
            </h1>
            <p className="mt-1 text-[13px] text-zinc-500">
              {CONDITION_LABELS[listing.condition]} · {listing.city} · {timeAgo(listing.created_at)}
            </p>

            <div className="mt-5 space-y-2">
              {listing.phone ? (
                showPhone ? (
                  <a
                    href={`tel:${listing.phone.replace(/[^\d+]/g, "")}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    <Phone className="h-4 w-4" />
                    {formatPhone(listing.phone)}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhone(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    <Phone className="h-4 w-4" />
                    Показать телефон
                  </button>
                )
              ) : (
                <p className="text-center text-[13px] text-zinc-400">Телефон не указан</p>
              )}

              <button
                type="button"
                onClick={share}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 py-2.5 text-sm font-medium transition-colors hover:border-zinc-300"
              >
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Ссылка скопирована" : "Поделиться"}
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <MessageSellerButton listingId={listing.id} sellerId={listing.sellerId} />
            <CompareToggle listingId={listing.id} withLabel />
          </div>

          <div className="mt-3">
            <SellerCard sellerId={listing.sellerId} city={listing.city} />
          </div>

          <CreditCalculator price={listing.price} />

          {market && (
            <div className="mt-3 rounded-2xl border border-zinc-200 p-5">
              <p className="text-[12px] uppercase tracking-[0.14em] text-zinc-400">Оценка цены</p>
              <p className="mt-1 text-[15px] font-medium">
                {market.label === "below" && `Ниже рынка на ${Math.abs(market.percent)}%`}
                {market.label === "above" && `Выше рынка на ${market.percent}%`}
                {market.label === "average" && "Цена на уровне рынка"}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
                Медиана похожих {listing.brand}
                {listing.year ? ` ${listing.year} г.` : ""} — {formatPrice(market.median)} сум по{" "}
                {market.sample} объявлениям.
              </p>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14 border-t border-zinc-200/80 pt-8">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Похожие объявления</h2>
            <Link
              href={`/search?brand=${encodeURIComponent(listing.brand)}`}
              className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Все {listing.brand}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      <Link
        href="/search"
        className="mt-10 inline-flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Вернуться в каталог
      </Link>
    </article>
  );
}

export default function ListingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
