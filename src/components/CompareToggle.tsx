"use client";

import { Scale } from "lucide-react";
import { MAX_COMPARE, useCompare } from "@/lib/compare";

export function CompareToggle({
  listingId,
  withLabel = false,
  className = "",
}: {
  listingId: string;
  withLabel?: boolean;
  className?: string;
}) {
  const { has, toggle, full } = useCompare();
  const active = has(listingId);
  const blocked = !active && full;

  if (withLabel) {
    return (
      <button
        type="button"
        disabled={blocked}
        onClick={() => toggle(listingId)}
        aria-pressed={active}
        title={blocked ? `Можно сравнить не больше ${MAX_COMPARE} машин` : undefined}
        className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          active
            ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700"
            : "border-zinc-200 hover:border-zinc-300"
        } ${className}`}
      >
        <Scale className="h-4 w-4" />
        {active ? "В сравнении" : "Сравнить"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(listingId);
      }}
      aria-label={active ? "Убрать из сравнения" : "Добавить к сравнению"}
      aria-pressed={active}
      title={blocked ? `Можно сравнить не больше ${MAX_COMPARE} машин` : "Сравнить"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm backdrop-blur transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "text-zinc-900" : ""
      } ${className}`}
    >
      <Scale className={`h-4 w-4 ${active ? "fill-zinc-900/10" : ""}`} />
    </button>
  );
}
