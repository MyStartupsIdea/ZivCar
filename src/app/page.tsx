"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";
import { BODY_LABELS, BRANDS, useListings, type BodyType } from "@/lib/listings";

const FEATURED_BODIES: BodyType[] = ["sedan", "suv", "hatchback", "minivan"];

export default function HomePage() {
  const { listings, ready } = useListings();
  const published = listings.filter((listing) => listing.published);
  const latest = published.slice(0, 8);
  const brands = BRANDS.filter((brand) => published.some((item) => item.brand === brand)).slice(
    0,
    8
  );
  const cityCount = new Set(published.map((item) => item.city)).size;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 text-center sm:pb-16 sm:pt-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
          Узбекистан · {ready ? `${published.length} объявлений` : "каталог"} ·{" "}
          {ready ? `${cityCount} городов` : "12 городов"}
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl text-[34px] font-semibold leading-[1.08] tracking-tight text-zinc-900 sm:text-[56px]">
          Купить авто
          <br className="hidden sm:block" /> без посредников
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-500">
          Бесплатные объявления от владельцев. Фото, название, описание — карточка готова за минуту.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <SearchBar />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Chevrolet", "Kia", "Toyota", "BYD", "Hyundai"].map((brand) => (
            <Link
              key={brand}
              href={`/search?q=${encodeURIComponent(brand)}`}
              className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-[13px] text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-[15px] font-medium tracking-tight">Марки</h2>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Весь каталог
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {brands.map((brand) => {
            const count = published.filter((item) => item.brand === brand).length;
            return (
              <Link
                key={brand}
                href={`/brands/${encodeURIComponent(brand)}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 px-3.5 py-3 text-[13px] transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <span className="font-medium">{brand}</span>
                <span className="text-zinc-400">{count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Новые объявления</h2>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Все объявления
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!ready ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-zinc-100" />
                <div className="mt-3 h-3.5 w-3/4 rounded bg-zinc-100" />
                <div className="mt-2 h-3.5 w-1/2 rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
            <p className="text-[15px] font-medium">Пока нет объявлений</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">
              Разместите первое — это бесплатно и займёт минуту.
            </p>
            <Link
              href="/new"
              className="mt-5 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Разместить объявление
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {latest.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-zinc-200/80 bg-zinc-50/60">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-[15px] font-medium tracking-tight">По типу кузова</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FEATURED_BODIES.map((body) => (
              <Link
                key={body}
                href={`/search?body=${body}`}
                className="group flex items-center justify-between rounded-xl bg-white px-4 py-4 text-[13px] font-medium transition-colors hover:bg-zinc-100"
              >
                {BODY_LABELS[body]}
                <ArrowRight className="h-3.5 w-3.5 text-zinc-300 transition-colors group-hover:text-zinc-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="flex flex-col gap-5 rounded-2xl bg-zinc-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-medium tracking-tight">Аналитика рынка</h2>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-zinc-500">
              Медианные цены по маркам и городам, структура предложения и оценка цены каждой
              карточки относительно похожих машин.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/analytics"
              className="rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Открыть аналитику
            </Link>
            <Link
              href="/compare"
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-300"
            >
              Сравнить авто
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { title: "Фотографии", text: "Загрузите до восьми снимков — первый станет обложкой." },
            { title: "Название и цена", text: "Марка, модель и цена. Остальные детали — по желанию." },
            { title: "Описание", text: "Расскажите о состоянии и нажмите «Создать карточку»." },
          ].map((item, index) => (
            <div key={item.title}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-[12px] font-medium text-zinc-500">
                {index + 1}
              </span>
              <h3 className="mt-3 text-[15px] font-medium tracking-tight">{item.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
