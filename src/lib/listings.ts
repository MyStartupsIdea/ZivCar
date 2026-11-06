"use client";

import { useEffect, useState } from "react";
import { getCurrentAccountId } from "@/lib/accounts";
import {
  deleteRemoteListing,
  fetchRemoteListings,
  pushListing,
  pushListings,
} from "@/lib/listings-remote";

export type Condition = "new" | "used" | "for_parts";
export type Fuel = "petrol" | "diesel" | "gas" | "hybrid" | "electric";
export type Transmission = "automatic" | "manual" | "variator" | "robot";
export type BodyType = "sedan" | "suv" | "hatchback" | "wagon" | "minivan" | "pickup";
export type Drive = "fwd" | "rwd" | "awd";

export const CONDITION_LABELS: Record<Condition, string> = {
  new: "Новая",
  used: "С пробегом",
  for_parts: "На запчасти",
};

export const FUEL_LABELS: Record<Fuel, string> = {
  petrol: "Бензин",
  diesel: "Дизель",
  gas: "Газ",
  hybrid: "Гибрид",
  electric: "Электро",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  automatic: "Автомат",
  manual: "Механика",
  variator: "Вариатор",
  robot: "Робот",
};

export const BODY_LABELS: Record<BodyType, string> = {
  sedan: "Седан",
  suv: "Кроссовер",
  hatchback: "Хэтчбек",
  wagon: "Универсал",
  minivan: "Минивэн",
  pickup: "Пикап",
};

export const DRIVE_LABELS: Record<Drive, string> = {
  fwd: "Передний",
  rwd: "Задний",
  awd: "Полный",
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
  condition: Condition;
  fuel: Fuel | null;
  transmission: Transmission | null;
  body: BodyType | null;
  drive: Drive | null;
  color: string | null;
  engine: number | null;
  owners: number | null;
  negotiable: boolean;
  exchange: boolean;
  phone: string;
  photos: string[];
  sellerId: string;
  sold_at: string | null;
  created_at: string;
  published: boolean;
  views: number;
};

export type ListingInput = Omit<
  Listing,
  "id" | "created_at" | "published" | "views" | "sellerId" | "sold_at"
> & {
  published?: boolean;
  sellerId?: string;
  sold_at?: string | null;
};

export const BRANDS = [
  "Chevrolet",
  "Daewoo",
  "Kia",
  "Hyundai",
  "Toyota",
  "BYD",
  "Chery",
  "Volkswagen",
  "Renault",
  "BMW",
  "Mercedes-Benz",
  "Lada",
];

export const CITIES = [
  "Ташкент",
  "Самарканд",
  "Бухара",
  "Наманган",
  "Андижан",
  "Фергана",
  "Навои",
  "Карши",
  "Термез",
  "Нукус",
  "Ургенч",
  "Джизак",
];

export const COLORS = [
  "Белый",
  "Чёрный",
  "Серебристый",
  "Серый",
  "Синий",
  "Красный",
  "Бежевый",
  "Зелёный",
];

export type SortOption = "newest" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Сначала новые",
  price_asc: "Сначала дешёвые",
  price_desc: "Сначала дорогие",
  mileage_asc: "Меньше пробег",
  year_desc: "Новее год",
};

const STORAGE_KEY = "avto.listings.v2";
const FAVORITES_KEY = "avto.favorites.v1";
export const MAX_PHOTOS = 8;

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

type SeedBody = Omit<
  Listing,
  "id" | "created_at" | "photos" | "published" | "phone" | "views" | "sellerId" | "sold_at"
> & { sellerId?: string };

const DEMO_SELLERS = ["u-aziz", "u-dilnoza", "u-rustam", "u-dealer"];
let seedCursor = 0;

function demo(id: string, days: number, data: SeedBody): Listing {
  return {
    id,
    created_at: daysAgo(days),
    photos: [],
    published: true,
    phone: "+998 90 123 45 67",
    views: 60 + ((id.length * 53 + data.price) % 340),
    ...data,
    sellerId: data.sellerId ?? DEMO_SELLERS[seedCursor++ % DEMO_SELLERS.length],
    sold_at: null,
  };
}

const SEED: Listing[] = [
  demo("demo-cobalt", 1, {
    title: "Chevrolet Cobalt 2022",
    description:
      "Один владелец, полная сервисная история у официального дилера. Комплектация LTZ: кондиционер, мультимедиа с камерой, парктроники. Не билась, не красилась. Все ТО пройдены вовремя, есть сервисная книжка.",
    price: 132_000_000,
    city: "Ташкент",
    brand: "Chevrolet",
    model: "Cobalt",
    year: 2022,
    mileage: 46_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "sedan",
    drive: "fwd",
    color: "Белый",
    engine: 1.5,
    owners: 1,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-sportage", 2, {
    title: "Kia Sportage 2021",
    description:
      "Куплена в Узбекистане, обслуживание только у дилера. Кожаный салон, панорамная крыша, полный привод, камера 360. Возможен обмен на седан с доплатой.",
    price: 315_000_000,
    city: "Ташкент",
    brand: "Kia",
    model: "Sportage",
    year: 2021,
    mileage: 68_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "suv",
    drive: "awd",
    color: "Серый",
    engine: 2.4,
    owners: 1,
    negotiable: true,
    exchange: true,
  }),
  demo("demo-camry", 3, {
    title: "Toyota Camry 2019",
    description:
      "Аккуратный седан в отличном состоянии. Салон чистый, не курили. Все расходники заменены, резина новая. Показываю в любое удобное время в центре города.",
    price: 289_000_000,
    city: "Самарканд",
    brand: "Toyota",
    model: "Camry",
    year: 2019,
    mileage: 124_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "sedan",
    drive: "fwd",
    color: "Чёрный",
    engine: 2.5,
    owners: 2,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-byd", 4, {
    title: "BYD Song Plus 2024",
    description:
      "Электромобиль, запас хода 520 км. Домашняя зарядка в комплекте. Гарантия производителя ещё действует. Причина продажи — переезд в другой город.",
    price: 429_000_000,
    city: "Ташкент",
    brand: "BYD",
    model: "Song Plus",
    year: 2024,
    mileage: 12_000,
    condition: "used",
    fuel: "electric",
    transmission: "automatic",
    body: "suv",
    drive: "fwd",
    color: "Синий",
    engine: null,
    owners: 1,
    negotiable: false,
    exchange: false,
  }),
  demo("demo-nexia", 6, {
    title: "Daewoo Nexia 3 2015",
    description:
      "Рабочая машина, ездит каждый день. Двигатель и коробка без нареканий, подвеска обслужена. Торг небольшой, документы в порядке.",
    price: 69_000_000,
    city: "Бухара",
    brand: "Daewoo",
    model: "Nexia 3",
    year: 2015,
    mileage: 210_000,
    condition: "used",
    fuel: "gas",
    transmission: "manual",
    body: "sedan",
    drive: "fwd",
    color: "Серебристый",
    engine: 1.5,
    owners: 3,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-elantra", 7, {
    title: "Hyundai Elantra 2020",
    description:
      "Серебристый седан, 2.0 автомат. Один владелец по договору. Обслуживание по регламенту, есть все чеки. Смотреть в центре города.",
    price: 198_000_000,
    city: "Наманган",
    brand: "Hyundai",
    model: "Elantra",
    year: 2020,
    mileage: 88_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "sedan",
    drive: "fwd",
    color: "Серебристый",
    engine: 2.0,
    owners: 1,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-damas", 9, {
    title: "Daewoo Damas 2018",
    description:
      "Отличный вариант для бизнеса: грузопассажирский, экономичный. Кузов без коррозии, салон сухой. Готов к дальней дороге.",
    price: 62_000_000,
    city: "Андижан",
    brand: "Daewoo",
    model: "Damas",
    year: 2018,
    mileage: 145_000,
    condition: "used",
    fuel: "gas",
    transmission: "manual",
    body: "minivan",
    drive: "rwd",
    color: "Белый",
    engine: 0.8,
    owners: 2,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-tiggo", 11, {
    title: "Chery Tiggo 8 Pro 2023",
    description:
      "Семиместный кроссовер, полный привод, панорама. На гарантии, ТО пройдены вовремя. Без ДТП и покраски, один владелец.",
    price: 349_000_000,
    city: "Фергана",
    brand: "Chery",
    model: "Tiggo 8 Pro",
    year: 2023,
    mileage: 31_000,
    condition: "used",
    fuel: "petrol",
    transmission: "robot",
    body: "suv",
    drive: "awd",
    color: "Белый",
    engine: 1.6,
    owners: 1,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-spark", 13, {
    title: "Chevrolet Spark 2019",
    description:
      "Компактная городская машина, расход 6 литров. Идеальна для ежедневных поездок по городу. Кондиционер работает отлично.",
    price: 96_000_000,
    city: "Ташкент",
    brand: "Chevrolet",
    model: "Spark",
    year: 2019,
    mileage: 74_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "hatchback",
    drive: "fwd",
    color: "Красный",
    engine: 1.25,
    owners: 2,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-lacetti", 15, {
    title: "Chevrolet Lacetti 2013",
    description:
      "Проверенная временем машина. Кузов целый, двигатель работает ровно. Нужен небольшой ремонт по ходовой — отсюда и цена.",
    price: 58_000_000,
    city: "Карши",
    brand: "Chevrolet",
    model: "Lacetti",
    year: 2013,
    mileage: 265_000,
    condition: "used",
    fuel: "petrol",
    transmission: "manual",
    body: "sedan",
    drive: "fwd",
    color: "Серый",
    engine: 1.6,
    owners: 4,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-tracker", 5, {
    title: "Chevrolet Tracker 2023",
    description:
      "Практически новая машина, на гарантии. Пробег родной, обслуживание у дилера. Камера, мультимедиа, подогрев сидений.",
    price: 219_000_000,
    city: "Ташкент",
    brand: "Chevrolet",
    model: "Tracker",
    year: 2023,
    mileage: 18_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "suv",
    drive: "fwd",
    color: "Синий",
    engine: 1.2,
    owners: 1,
    negotiable: false,
    exchange: false,
  }),
  demo("demo-k5", 8, {
    title: "Kia K5 2022",
    description:
      "Бизнес-седан в максимальной комплектации: вентиляция сидений, адаптивный круиз, аудиосистема Bose. Обслужен, готов к продаже.",
    price: 372_000_000,
    city: "Ташкент",
    brand: "Kia",
    model: "K5",
    year: 2022,
    mileage: 39_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "sedan",
    drive: "fwd",
    color: "Чёрный",
    engine: 2.0,
    owners: 1,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-tucson", 10, {
    title: "Hyundai Tucson 2021",
    description:
      "Кроссовер с полным приводом и панорамной крышей. Один владелец, все ТО у дилера. Без вложений, садись и езжай.",
    price: 298_000_000,
    city: "Самарканд",
    brand: "Hyundai",
    model: "Tucson",
    year: 2021,
    mileage: 61_000,
    condition: "used",
    fuel: "diesel",
    transmission: "automatic",
    body: "suv",
    drive: "awd",
    color: "Серый",
    engine: 2.0,
    owners: 1,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-polo", 12, {
    title: "Volkswagen Polo 2018",
    description:
      "Экономичный хэтчбек, отлично подходит для города. Салон ухоженный, не курили. Вложений не требует.",
    price: 128_000_000,
    city: "Ташкент",
    brand: "Volkswagen",
    model: "Polo",
    year: 2018,
    mileage: 96_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "hatchback",
    drive: "fwd",
    color: "Белый",
    engine: 1.6,
    owners: 2,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-eclass", 14, {
    title: "Mercedes-Benz E 200 2017",
    description:
      "Ухоженный бизнес-седан, полная история обслуживания. Кожаный салон, панорама, адаптивная подвеска. Все расходники свежие.",
    price: 395_000_000,
    city: "Ташкент",
    brand: "Mercedes-Benz",
    model: "E 200",
    year: 2017,
    mileage: 138_000,
    condition: "used",
    fuel: "petrol",
    transmission: "automatic",
    body: "sedan",
    drive: "rwd",
    color: "Чёрный",
    engine: 2.0,
    owners: 2,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-tiggo4", 16, {
    title: "Chery Tiggo 4 2022",
    description:
      "Компактный кроссовер на гарантии. Пробег небольшой, обслуживание вовремя. Экономичный расход по городу.",
    price: 198_000_000,
    city: "Навои",
    brand: "Chery",
    model: "Tiggo 4",
    year: 2022,
    mileage: 44_000,
    condition: "used",
    fuel: "petrol",
    transmission: "variator",
    body: "suv",
    drive: "fwd",
    color: "Бежевый",
    engine: 1.5,
    owners: 1,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-login", 18, {
    title: "Renault Logan 2015",
    description:
      "Неубиваемая машина для работы и такси. Газ-баллон установлен официально. Документы в порядке, торг у капота.",
    price: 74_000_000,
    city: "Ургенч",
    brand: "Renault",
    model: "Logan",
    year: 2015,
    mileage: 240_000,
    condition: "used",
    fuel: "gas",
    transmission: "manual",
    body: "sedan",
    drive: "fwd",
    color: "Белый",
    engine: 1.6,
    owners: 3,
    negotiable: true,
    exchange: false,
  }),
  demo("demo-new-cobalt", 2, {
    title: "Chevrolet Cobalt 2024",
    description:
      "Новая машина из салона, пробег 3 000 км. Гарантия, полный комплект документов. Продаю по личным причинам, без торга.",
    price: 168_000_000,
    city: "Ташкент",
    brand: "Chevrolet",
    model: "Cobalt",
    year: 2024,
    mileage: 3_000,
    condition: "new",
    fuel: "petrol",
    transmission: "automatic",
    body: "sedan",
    drive: "fwd",
    color: "Белый",
    engine: 1.5,
    owners: 1,
    negotiable: false,
    exchange: false,
  }),
];

function isListingArray(value: unknown): value is Listing[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Listing).id === "string" &&
        typeof (item as Listing).title === "string"
    )
  );
}

function normalizeListing(listing: Listing): Listing {
  return {
    ...listing,
    photos: Array.isArray(listing.photos) ? listing.photos : [],
    sellerId: listing.sellerId ?? DEMO_SELLERS[0],
    sold_at: listing.sold_at ?? null,
  };
}

function readRaw(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    const parsed: unknown = JSON.parse(stored);
    return isListingArray(parsed) ? parsed.map(normalizeListing) : SEED;
  } catch {
    return SEED;
  }
}

function persist(list: Listing[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("avto:listings-changed"));
}

let hydration: Promise<void> | null = null;

async function hydrateFromRemote(): Promise<void> {
  const remote = await fetchRemoteListings();
  if (!remote) return;

  if (remote.length === 0) {
    // First run against an empty database: publish the demo catalogue once.
    const local = getListings();
    if (local.length > 0) await pushListings(local);
    return;
  }

  persist(remote);
}

/** Pulls listings from Supabase once per page load; no-op without credentials. */
export function hydrateListings(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!hydration) {
    hydration = hydrateFromRemote().catch((error) => {
      console.warn("[supabase] синхронизация не удалась:", error);
    });
  }
  return hydration;
}

/** Drops the cached hydration so the next mount refetches (used after edits). */
export function refreshListings(): Promise<void> {
  hydration = null;
  return hydrateListings();
}

export function getListings(): Listing[] {
  return readRaw()
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getListing(id: string): Listing | null {
  return readRaw().find((listing) => listing.id === id) ?? null;
}

export function createListing(input: ListingInput): Listing {
  const listing: Listing = {
    ...input,
    id: `l-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    published: input.published ?? true,
    views: 0,
    sellerId: input.sellerId ?? getCurrentAccountId(),
    sold_at: input.sold_at ?? null,
  };
  persist([listing, ...readRaw()]);
  void pushListing(listing);
  return listing;
}

export function updateListing(id: string, patch: Partial<ListingInput>): Listing | null {
  const list = readRaw();
  const index = list.findIndex((listing) => listing.id === id);
  if (index === -1) return null;
  const updated: Listing = {
    ...list[index],
    ...patch,
    id,
    created_at: list[index].created_at,
    views: list[index].views,
  };
  list[index] = updated;
  persist(list);
  void pushListing(updated);
  return updated;
}

export function deleteListing(id: string): void {
  persist(readRaw().filter((listing) => listing.id !== id));
  void deleteRemoteListing(id);
}

export function togglePublished(id: string): Listing | null {
  const current = getListing(id);
  if (!current) return null;
  return updateListing(id, { published: !current.published });
}

export function incrementViews(id: string): void {
  const list = readRaw();
  const index = list.findIndex((listing) => listing.id === id);
  if (index === -1) return;
  list[index] = { ...list[index], views: list[index].views + 1 };
  persist(list);
  void pushListing(list[index]);
}

export type ListingFilters = {
  q?: string;
  brand?: string;
  city?: string;
  body?: string;
  fuel?: string;
  transmission?: string;
  condition?: string;
  min?: number;
  max?: number;
  yearFrom?: number;
  yearTo?: number;
  maxMileage?: number;
  sort?: SortOption;
};

function haystack(listing: Listing): string {
  return [
    listing.title,
    listing.brand,
    listing.model,
    listing.city,
    listing.description,
    listing.year ? String(listing.year) : "",
  ]
    .join(" ")
    .toLowerCase();
}

export function filterListings(listings: Listing[], filters: ListingFilters): Listing[] {
  const tokens = (filters.q ?? "")
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const result = listings.filter((listing) => {
    if (filters.brand && listing.brand !== filters.brand) return false;
    if (filters.city && listing.city !== filters.city) return false;
    if (filters.body && listing.body !== filters.body) return false;
    if (filters.fuel && listing.fuel !== filters.fuel) return false;
    if (filters.transmission && listing.transmission !== filters.transmission) return false;
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.min != null && listing.price < filters.min) return false;
    if (filters.max != null && listing.price > filters.max) return false;
    if (filters.yearFrom != null && (listing.year ?? 0) < filters.yearFrom) return false;
    if (filters.yearTo != null && (listing.year ?? 0) > filters.yearTo) return false;
    if (filters.maxMileage != null && (listing.mileage ?? 0) > filters.maxMileage) return false;
    if (tokens.length > 0) {
      const text = haystack(listing);
      return tokens.every((token) => text.includes(token));
    }
    return true;
  });

  return result.sort((a, b) => {
    switch (filters.sort) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "mileage_asc":
        return (a.mileage ?? Number.MAX_SAFE_INTEGER) - (b.mileage ?? Number.MAX_SAFE_INTEGER);
      case "year_desc":
        return (b.year ?? 0) - (a.year ?? 0);
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
}

export function similarListings(listing: Listing, all: Listing[], limit = 4): Listing[] {
  return all
    .filter((item) => item.id !== listing.id && item.published)
    .map((item) => {
      let score = 0;
      if (item.brand === listing.brand) score += 4;
      if (item.body && item.body === listing.body) score += 2;
      if (item.year && listing.year && Math.abs(item.year - listing.year) <= 1) score += 2;
      if (listing.price > 0) {
        const diff = Math.abs(item.price - listing.price) / listing.price;
        if (diff <= 0.1) score += 2;
        else if (diff <= 0.3) score += 1;
      }
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function listingsBySeller(listings: Listing[], sellerId: string): Listing[] {
  return listings
    .filter((listing) => listing.sellerId === sellerId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function markSold(id: string): Listing | null {
  return updateListing(id, { published: false, sold_at: new Date().toISOString() });
}

export function markAvailable(id: string): Listing | null {
  return updateListing(id, { published: true, sold_at: null });
}

export function countByBrand(listings: Listing[]): Array<{ brand: string; count: number }> {
  const counts = new Map<string, number>();
  for (const listing of listings) {
    counts.set(listing.brand, (counts.get(listing.brand) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);
}

export function useListings(): { listings: Listing[]; ready: boolean } {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setListings(getListings());
      setReady(true);
    };
    sync();
    void hydrateListings();
    window.addEventListener("avto:listings-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:listings-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { listings, ready };
}

export function useListing(id: string): { listing: Listing | null; ready: boolean } {
  const [listing, setListing] = useState<Listing | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setListing(getListing(id));
      setReady(true);
    };
    sync();
    void hydrateListings();
    window.addEventListener("avto:listings-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:listings-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  return { listing, ready };
}

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function useFavorites(): {
  ids: string[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
} {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIds(readFavorites());
      setReady(true);
    };
    sync();
    window.addEventListener("avto:favorites-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:favorites-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function toggle(id: string) {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("avto:favorites-changed"));
  }

  return { ids, ready, has: (id: string) => ids.includes(id), toggle };
}
