"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { CHECKLIST, TOTAL_CHECKS, useChecklist } from "@/lib/checklist";

export default function GuidesPage() {
  const { checked, ready, toggle, reset, progress } = useChecklist();

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
        Перед покупкой
      </p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-tight sm:text-[32px]">
        Чек-лист осмотра автомобиля
      </h1>
      <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-zinc-500">
        {TOTAL_CHECKS} пунктов, которые стоит проверить до передачи денег. Отметки сохраняются в
        браузере — можно вернуться к осмотру позже.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 p-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-zinc-500">Готовность к сделке</span>
          <span className="font-medium">
            {ready ? `${checked.length} из ${TOTAL_CHECKS}` : `0 из ${TOTAL_CHECKS}`}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-zinc-900 transition-[width] duration-300"
            style={{ width: `${ready ? progress : 0}%` }}
          />
        </div>
        {ready && checked.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-zinc-400 transition-colors hover:text-zinc-900"
          >
            <RotateCcw className="h-3 w-3" />
            Сбросить отметки
          </button>
        )}
      </div>

      <div className="mt-8 space-y-8">
        {CHECKLIST.map((group) => (
          <section key={group.group}>
            <h2 className="text-[15px] font-medium tracking-tight">{group.group}</h2>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => {
                const active = checked.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-pressed={active}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                        active
                          ? "border-zinc-900/10 bg-zinc-50"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[14px] ${
                            active ? "text-zinc-500 line-through" : "text-zinc-900"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500">
                          {item.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-100 pt-6">
        <Link
          href="/search"
          className="rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Выбрать автомобиль
        </Link>
        <Link
          href="/analytics"
          className="rounded-full border border-zinc-200 px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-300"
        >
          Проверить цену по рынку
        </Link>
      </div>
    </div>
  );
}
