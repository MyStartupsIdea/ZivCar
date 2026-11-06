"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookmarkPlus, Check, Search, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { EMPTY_FILTERS, FilterPanel, type FilterValues } from "@/components/FilterPanel";
import { SORT_LABELS, filterListings, useListings, type SortOption } from "@/lib/listings";
import { saveSearch } from "@/lib/saved-searches";

const FILTER_KEYS = Object.keys(EMPTY_FILTERS) as Array<keyof FilterValues>;
const SORT_KEYS = Object.keys(SORT_LABELS) as SortOption[];

function toNumber(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

function Catalog() {
  const router = useRouter();
  const params = useSearchParams();
  const { listings, ready } = useListings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [term, setTerm] = useState(params.get("q") ?? "");
  const [savedFlash, setSavedFlash] = useState(false);

  const query = params.get("q") ?? "";
  const sort = (params.get("sort") as SortOption) || "newest";

  const values = useMemo(() => {
    const next: FilterValues = { ...EMPTY_FILTERS };
    for (const key of FILTER_KEYS) next[key] = params.get(key) ?? "";
    return next;
  }, [params]);

  const results = useMemo(
    () =>
      filterListings(
        listings.filter((listing) => listing.published),
        {
          q: query,
          brand: values.brand || undefined,
          city: values.city || undefined,
          body: values.body || undefined,
          fuel: values.fuel || undefined,
          transmission: values.transmission || undefined,
          condition: values.condition || undefined,
          min: toNumber(values.min),
          max: toNumber(values.max),
          yearFrom: toNumber(values.yearFrom),
          yearTo: toNumber(values.yearTo),
          maxMileage: toNumber(values.maxMileage),
          sort,
        }
      ),
    [listings, query, values, sort]
  );

  const shown = Number(params.get("show") ?? 12) || 12;
  const visible = results.slice(0, shown);

  function update(patch: Partial<FilterValues>) {
    for (const [key, value] of Object.entries(patch)) {
      setParam(key, value ?? "");
    }
  }

  function setParam(key: string, value: string) {
    const search = new URLSearchParams(params.toString());
    if (value) search.set(key, value);
    else search.delete(key);
    const suffix = search.toString();
    router.replace(suffix ? `/search?${suffix}` : "/search", { scroll: false });
  }

  function reset() {
    setTerm("");
    router.replace("/search", { scroll: false });
  }

  const activeFilters = FILTER_KEYS.filter((key) => values[key]).length + (query ? 1 : 0);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight sm:text-[32px]">Каталог</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {ready ? `${results.length} объявлений` : "Загружаем объявления…"}
            {query ? ` по запросу «${query}»` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              saveSearch("", params.toString());
              setSavedFlash(true);
              window.setTimeout(() => setSavedFlash(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-[13px] text-zinc-600 transition-colors hover:border-zinc-300"
          >
            {savedFlash ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5" />
            )}
            {savedFlash ? "Поиск сохранён" : "Сохранить поиск"}
          </button>
          <label className="flex items-center gap-2 text-[13px] text-zinc-500">
          Сортировка
          <select
            value={sort}
            onChange={(event) =>
              setParam("sort", event.target.value === "newest" ? "" : event.target.value)
            }
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 outline-none focus:border-zinc-300"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
          </label>
        </div>
      </div>

      <div className="mt-7 flex gap-8">
        <aside className="sticky top-20 hidden w-60 shrink-0 self-start lg:block">
          <FilterPanel values={values} onChange={update} onReset={reset} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <form
              className="relative flex-1"
              onSubmit={(event) => {
                event.preventDefault();
                setParam("q", term.trim());
              }}
            >
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Марка, модель или город"
                aria-label="Поиск по каталогу"
                className="h-11 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 text-[14px] outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
              />
            </form>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-zinc-200 px-4 text-[13px] font-medium lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
              {activeFilters > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] text-white">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 inline-flex items-center gap-1 text-[12px] text-zinc-400 transition-colors hover:text-zinc-900"
            >
              <X className="h-3 w-3" />
              Сбросить все фильтры
            </button>
          )}

          {ready && results.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
              <p className="text-[15px] font-medium">Ничего не найдено</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                Попробуйте изменить запрос или сбросить фильтры.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:border-zinc-300"
              >
                Показать все объявления
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {results.length > visible.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setParam("show", String(shown + 12))}
                    className="rounded-full border border-zinc-200 px-5 py-2.5 text-[13px] font-medium transition-colors hover:border-zinc-300"
                  >
                    Показать ещё {Math.min(12, results.length - visible.length)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Закрыть фильтры"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Закрыть"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterPanel values={values} onChange={update} onReset={reset} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white"
            >
              Показать {results.length} объявлений
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-16 text-sm text-zinc-400">Загрузка каталога…</div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
