"use client";

import { RotateCcw } from "lucide-react";
import {
  BODY_LABELS,
  BRANDS,
  CITIES,
  CONDITION_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  type BodyType,
  type Condition,
  type Fuel,
  type Transmission,
} from "@/lib/listings";
import { digitsOnly, formatPrice } from "@/lib/format";

export type FilterValues = {
  brand: string;
  city: string;
  min: string;
  max: string;
  yearFrom: string;
  yearTo: string;
  maxMileage: string;
  body: string;
  fuel: string;
  transmission: string;
  condition: string;
};

export const EMPTY_FILTERS: FilterValues = {
  brand: "",
  city: "",
  min: "",
  max: "",
  yearFrom: "",
  yearTo: "",
  maxMileage: "",
  body: "",
  fuel: "",
  transmission: "",
  condition: "",
};

function Chips<T extends string>({
  options,
  labels,
  value,
  onSelect,
}: {
  options: T[];
  labels: Record<T, string>;
  value: string;
  onSelect: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? "" : option)}
            className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5";

export function FilterPanel({
  values,
  onChange,
  onReset,
}: {
  values: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-medium tracking-tight">Фильтры</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[12px] text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <RotateCcw className="h-3 w-3" />
          Сбросить
        </button>
      </div>

      <Section title="Марка">
        <select
          value={values.brand}
          onChange={(event) => onChange({ brand: event.target.value })}
          aria-label="Марка"
          className={inputClass}
        >
          <option value="">Все марки</option>
          {BRANDS.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Город">
        <select
          value={values.city}
          onChange={(event) => onChange({ city: event.target.value })}
          aria-label="Город"
          className={inputClass}
        >
          <option value="">Весь Узбекистан</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Цена, сум">
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            aria-label="Цена от"
            placeholder="от"
            value={values.min ? formatPrice(Number(values.min)) : ""}
            onChange={(event) => onChange({ min: digitsOnly(event.target.value).slice(0, 12) })}
            className={inputClass}
          />
          <input
            inputMode="numeric"
            aria-label="Цена до"
            placeholder="до"
            value={values.max ? formatPrice(Number(values.max)) : ""}
            onChange={(event) => onChange({ max: digitsOnly(event.target.value).slice(0, 12) })}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Год выпуска">
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            aria-label="Год от"
            placeholder="от"
            value={values.yearFrom}
            onChange={(event) => onChange({ yearFrom: digitsOnly(event.target.value).slice(0, 4) })}
            className={inputClass}
          />
          <input
            inputMode="numeric"
            aria-label="Год до"
            placeholder="до"
            value={values.yearTo}
            onChange={(event) => onChange({ yearTo: digitsOnly(event.target.value).slice(0, 4) })}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Пробег до, км">
        <input
          inputMode="numeric"
          aria-label="Пробег до"
          placeholder="100 000"
          value={values.maxMileage ? formatPrice(Number(values.maxMileage)) : ""}
          onChange={(event) =>
            onChange({ maxMileage: digitsOnly(event.target.value).slice(0, 7) })
          }
          className={inputClass}
        />
      </Section>

      <Section title="Кузов">
        <Chips
          options={Object.keys(BODY_LABELS) as BodyType[]}
          labels={BODY_LABELS}
          value={values.body}
          onSelect={(body) => onChange({ body })}
        />
      </Section>

      <Section title="Топливо">
        <Chips
          options={Object.keys(FUEL_LABELS) as Fuel[]}
          labels={FUEL_LABELS}
          value={values.fuel}
          onSelect={(fuel) => onChange({ fuel })}
        />
      </Section>

      <Section title="Коробка">
        <Chips
          options={Object.keys(TRANSMISSION_LABELS) as Transmission[]}
          labels={TRANSMISSION_LABELS}
          value={values.transmission}
          onSelect={(transmission) => onChange({ transmission })}
        />
      </Section>

      <Section title="Состояние">
        <Chips
          options={Object.keys(CONDITION_LABELS) as Condition[]}
          labels={CONDITION_LABELS}
          value={values.condition}
          onSelect={(condition) => onChange({ condition })}
        />
      </Section>
    </div>
  );
}
