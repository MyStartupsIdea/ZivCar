"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { marketSummary } from "@/lib/analytics";
import { useListings } from "@/lib/listings";
import { formatMileage, formatPrice } from "@/lib/format";

export default function AnalyticsPage() {
  const { listings, ready } = useListings();
  const summary = marketSummary(listings);
  const maxBrand = summary.byBrand[0]?.count ?? 1;
  const maxBody = summary.byBody[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
        Аналитика рынка
      </p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-tight sm:text-[32px]">
        Цены и структура предложения
      </h1>
      <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-zinc-500">
        Медианные цены по маркам, городам и типам кузова. Считается по активным объявлениям
        площадки: чем больше выборка, тем точнее ориентир.
      </p>

      {!ready ? (
        <div className="mt-8 grid gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : (
        <>
          <dl className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Объявлений", value: String(summary.total) },
              { label: "Медианная цена", value: `${formatPrice(summary.medianPrice)} сум` },
              { label: "Средний год", value: summary.averageYear ? String(summary.averageYear) : "—" },
              {
                label: "Средний пробег",
                value: formatMileage(summary.averageMileage) ?? "—",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-zinc-50 px-4 py-4">
                <dt className="text-[11px] uppercase tracking-[0.1em] text-zinc-400">
                  {item.label}
                </dt>
                <dd className="mt-1 text-[17px] font-semibold leading-tight tracking-tight">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Медианная цена по маркам</h2>
              <Link href="/search" className="text-[13px] text-zinc-500 hover:text-zinc-900">
                Смотреть авто
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-[0.1em] text-zinc-400">
                    <th className="py-2 font-normal">Марка</th>
                    <th className="py-2 font-normal">Объявлений</th>
                    <th className="py-2 font-normal">Доля</th>
                    <th className="py-2 text-right font-normal">Медиана</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byBrand.map((brand) => (
                    <tr key={brand.brand} className="border-b border-zinc-50">
                      <td className="py-2.5 text-[14px]">
                        <Link
                          href={`/brands/${encodeURIComponent(brand.brand)}`}
                          className="transition-colors hover:text-zinc-500"
                        >
                          {brand.brand}
                        </Link>
                      </td>
                      <td className="py-2.5 text-[13px] text-zinc-500">{brand.count}</td>
                      <td className="py-2.5">
                        <span className="block h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-zinc-100">
                          <span
                            className="block h-full rounded-full bg-zinc-900"
                            style={{ width: `${Math.round((brand.count / maxBrand) * 100)}%` }}
                          />
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-[13px] font-medium">
                        {formatPrice(brand.medianPrice)} сум
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Кузова</h2>
              <ul className="mt-4 space-y-3">
                {summary.byBody.map((body) => (
                  <li key={body.body}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-zinc-700">{body.label}</span>
                      <span className="text-zinc-400">{body.count}</span>
                    </div>
                    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <span
                        className="block h-full rounded-full bg-zinc-900"
                        style={{ width: `${Math.round((body.count / maxBody) * 100)}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight">Города</h2>
              <ul className="mt-4 space-y-2">
                {summary.byCity.slice(0, 6).map((city) => (
                  <li
                    key={city.city}
                    className="flex items-center justify-between border-b border-zinc-50 pb-2 text-[13px]"
                  >
                    <Link
                      href={`/search?city=${encodeURIComponent(city.city)}`}
                      className="transition-colors hover:text-zinc-500"
                    >
                      {city.city}
                    </Link>
                    <span className="text-zinc-400">
                      {city.count} · {formatPrice(city.medianPrice)} сум
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {summary.cheapestCity && summary.cheapestCity.count >= 2 && (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-zinc-200 p-4">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <p className="text-[13px] leading-relaxed text-zinc-600">
                Самая доступная медиана — в городе {summary.cheapestCity.city}:{" "}
                {formatPrice(summary.cheapestCity.medianPrice)} сум при {summary.cheapestCity.count}{" "}
                объявлени(ях). Проверьте, нет ли рядом подходящего варианта.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
