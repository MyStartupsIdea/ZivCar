import { BODY_LABELS, type BodyType, type Listing } from "@/lib/listings";

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

export type BrandStat = { brand: string; count: number; medianPrice: number };
export type BodyStat = { body: BodyType | "other"; label: string; count: number };
export type CityStat = { city: string; count: number; medianPrice: number };

export type MarketSummary = {
  total: number;
  medianPrice: number;
  averageYear: number;
  averageMileage: number;
  byBrand: BrandStat[];
  byBody: BodyStat[];
  byCity: CityStat[];
  cheapestCity: CityStat | null;
};

export function marketSummary(listings: Listing[]): MarketSummary {
  const active = listings.filter((listing) => listing.published);
  const prices = active.map((listing) => listing.price).filter((price) => price > 0);
  const years = active.map((listing) => listing.year).filter((year): year is number => !!year);
  const mileages = active
    .map((listing) => listing.mileage)
    .filter((mileage): mileage is number => mileage != null);

  const brandMap = new Map<string, number[]>();
  const bodyMap = new Map<BodyType | "other", number>();
  const cityMap = new Map<string, number[]>();

  for (const listing of active) {
    const brandPrices = brandMap.get(listing.brand) ?? [];
    brandPrices.push(listing.price);
    brandMap.set(listing.brand, brandPrices);

    const body: BodyType | "other" = listing.body ?? "other";
    bodyMap.set(body, (bodyMap.get(body) ?? 0) + 1);

    const cityPrices = cityMap.get(listing.city) ?? [];
    cityPrices.push(listing.price);
    cityMap.set(listing.city, cityPrices);
  }

  const byBrand: BrandStat[] = [...brandMap.entries()]
    .map(([brand, values]) => ({ brand, count: values.length, medianPrice: median(values) }))
    .sort((a, b) => b.count - a.count || a.medianPrice - b.medianPrice);

  const byBody: BodyStat[] = [...bodyMap.entries()]
    .map(([body, count]) => ({
      body,
      label: body === "other" ? "Другое" : BODY_LABELS[body],
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const byCity: CityStat[] = [...cityMap.entries()]
    .map(([city, values]) => ({ city, count: values.length, medianPrice: median(values) }))
    .sort((a, b) => b.count - a.count);

  const withPrices = byCity.filter((city) => city.count >= 1);

  return {
    total: active.length,
    medianPrice: median(prices),
    averageYear:
      years.length > 0 ? Math.round(years.reduce((sum, year) => sum + year, 0) / years.length) : 0,
    averageMileage:
      mileages.length > 0
        ? Math.round(mileages.reduce((sum, value) => sum + value, 0) / mileages.length)
        : 0,
    byBrand,
    byBody,
    byCity,
    cheapestCity:
      withPrices.length > 0
        ? [...withPrices].sort((a, b) => a.medianPrice - b.medianPrice)[0]
        : null,
  };
}

export type PriceIndex = {
  sample: number;
  median: number;
  percent: number;
  label: "below" | "average" | "above";
};

export function priceIndex(listing: Listing, all: Listing[]): PriceIndex | null {
  const peers = all.filter(
    (item) =>
      item.id !== listing.id &&
      item.published &&
      item.brand === listing.brand &&
      (item.year == null || listing.year == null || Math.abs(item.year - listing.year) <= 1)
  );

  if (peers.length < 2 || listing.price <= 0) return null;

  const reference = median(peers.map((item) => item.price));
  if (reference <= 0) return null;

  const percent = Math.round(((listing.price - reference) / reference) * 100);
  return {
    sample: peers.length,
    median: reference,
    percent,
    label: percent <= -8 ? "below" : percent >= 8 ? "above" : "average",
  };
}

export function pricePerYear(listing: Listing): number | null {
  if (!listing.year || listing.price <= 0) return null;
  const age = Math.max(1, new Date().getFullYear() - listing.year);
  return Math.round(listing.price / age);
}
