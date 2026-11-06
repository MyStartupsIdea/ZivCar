"use client";

import Link from "next/link";
import { Trash2, X } from "lucide-react";
import { CarArt } from "@/components/CarArt";
import { MAX_COMPARE, useCompare } from "@/lib/compare";
import {
  BODY_LABELS,
  CONDITION_LABELS,
  DRIVE_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  useListings,
  type Listing,
} from "@/lib/listings";
import { formatMileage, formatPrice, timeAgo } from "@/lib/format";

type Cell = { text: string; best?: boolean };

function SpecRow({ label, cells }: { label: string; cells: Cell[] }) {
  return (
    <tr className="border-t border-zinc-100">
      <th className="w-40 py-3 pr-4 text-left align-top text-[12px] font-normal uppercase tracking-[0.1em] text-zinc-400">
        {label}
      </th>
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`py-3 pr-4 align-top text-[14px] ${
            cell.best ? "font-semibold text-zinc-900" : "text-zinc-700"
          }`}
        >
          {cell.text}
          {cell.best && <span className="ml-1.5 text-[10px] uppercase text-emerald-600">лучше</span>}
        </td>
      ))}
    </tr>
  );
}

export default function ComparePage() {
  const { ids, ready, remove, clear } = useCompare();
  const { listings, ready: listingsReady } = useListings();

  const cars = ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is Listing => Boolean(listing));

  const loading = !ready || !listingsReady;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Список сравнения пуст</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">
          Добавьте до {MAX_COMPARE} автомобилей — кнопка со шкалой есть на каждой карточке.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  const prices = cars.map((car) => car.price);
  const mileages = cars.map((car) => car.mileage ?? Number.POSITIVE_INFINITY);
  const years = cars.map((car) => car.year ?? 0);
  const owners = cars.map((car) => car.owners ?? Number.POSITIVE_INFINITY);
  const best = {
    price: Math.min(...prices),
    mileage: Math.min(...mileages),
    year: Math.max(...years),
    owners: Math.min(...owners),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight sm:text-[32px]">Сравнение</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {cars.length} из {MAX_COMPARE} машин · лучшие значения подсвечены
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-[13px] transition-colors hover:border-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
          Очистить
        </button>
      </div>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-40 pb-3" />
              {cars.map((car) => (
                <th key={car.id} className="w-1/4 pb-3 pr-4 align-top">
                  <div className="relative overflow-hidden rounded-2xl bg-zinc-100">
                    <div className="aspect-[4/3]">
                      {car.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={car.photos[0]}
                          alt={car.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CarArt seed={car.id} label={car.title} className="h-full w-full" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(car.id)}
                      aria-label={`Убрать ${car.title} из сравнения`}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-500 backdrop-blur transition-colors hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Link
                    href={`/ads/${car.id}`}
                    className="mt-2.5 block text-[14px] font-medium leading-snug transition-colors hover:text-zinc-600"
                  >
                    {car.title}
                  </Link>
                  <p className="mt-0.5 text-[12px] text-zinc-500">{timeAgo(car.created_at)}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SpecRow
              label="Цена"
              cells={cars.map((car) => ({
                text: `${formatPrice(car.price)} сум`,
                best: car.price === best.price && cars.length > 1,
              }))}
            />
            <SpecRow
              label="Год"
              cells={cars.map((car) => ({
                text: car.year ? String(car.year) : "—",
                best: (car.year ?? 0) === best.year && cars.length > 1,
              }))}
            />
            <SpecRow
              label="Пробег"
              cells={cars.map((car) => ({
                text: formatMileage(car.mileage) ?? "—",
                best: (car.mileage ?? Number.POSITIVE_INFINITY) === best.mileage && cars.length > 1,
              }))}
            />
            <SpecRow
              label="Состояние"
              cells={cars.map((car) => ({ text: CONDITION_LABELS[car.condition] }))}
            />
            <SpecRow
              label="Кузов"
              cells={cars.map((car) => ({
                text: car.body ? BODY_LABELS[car.body] : "—",
              }))}
            />
            <SpecRow
              label="Двигатель"
              cells={cars.map((car) => ({
                text: car.engine ? `${car.engine} л` : "—",
              }))}
            />
            <SpecRow
              label="Топливо"
              cells={cars.map((car) => ({
                text: car.fuel ? FUEL_LABELS[car.fuel] : "—",
              }))}
            />
            <SpecRow
              label="Коробка"
              cells={cars.map((car) => ({
                text: car.transmission ? TRANSMISSION_LABELS[car.transmission] : "—",
              }))}
            />
            <SpecRow
              label="Привод"
              cells={cars.map((car) => ({
                text: car.drive ? DRIVE_LABELS[car.drive] : "—",
              }))}
            />
            <SpecRow label="Цвет" cells={cars.map((car) => ({ text: car.color ?? "—" }))} />
            <SpecRow
              label="Владельцев"
              cells={cars.map((car) => ({
                text: car.owners ? String(car.owners) : "—",
                best: (car.owners ?? Number.POSITIVE_INFINITY) === best.owners && cars.length > 1,
              }))}
            />
            <SpecRow label="Город" cells={cars.map((car) => ({ text: car.city }))} />
            <SpecRow
              label="Просмотры"
              cells={cars.map((car) => ({ text: String(car.views) }))}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
