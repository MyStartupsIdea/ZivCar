"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { CREDIT_PRESETS, creditPlan } from "@/lib/credit";
import { formatPrice } from "@/lib/format";

export function CreditCalculator({ price }: { price: number }) {
  const [open, setOpen] = useState(false);
  const [downPercent, setDownPercent] = useState(20);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(18);

  const plan = creditPlan({ price, downPercent, months, annualRate: rate });

  return (
    <div className="mt-3 rounded-2xl border border-zinc-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="inline-flex items-center gap-2 text-[13px] font-medium">
          <Calculator className="h-4 w-4 text-zinc-400" />
          Рассрочка и кредит
        </span>
        <span className="text-[12px] text-zinc-400">
          от {formatPrice(creditPlan({ price, downPercent: 30, months: 36, annualRate: 22 }).monthly)} сум/мес
        </span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {CREDIT_PRESETS.map((preset) => {
              const active =
                preset.months === months &&
                preset.annualRate === rate &&
                preset.downPercent === downPercent;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMonths(preset.months);
                    setRate(preset.annualRate);
                    setDownPercent(preset.downPercent);
                  }}
                  className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="flex items-center justify-between text-[12px] text-zinc-500">
                Первый взнос
                <span className="font-medium text-zinc-900">
                  {downPercent}% · {formatPrice(plan.down)} сум
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={70}
                step={5}
                value={downPercent}
                onChange={(event) => setDownPercent(Number(event.target.value))}
                className="mt-1.5 w-full accent-zinc-900"
              />
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-[12px] text-zinc-500">
                Срок
                <span className="font-medium text-zinc-900">{months} мес</span>
              </span>
              <input
                type="range"
                min={3}
                max={84}
                step={3}
                value={months}
                onChange={(event) => setMonths(Number(event.target.value))}
                className="mt-1.5 w-full accent-zinc-900"
              />
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-[12px] text-zinc-500">
                Ставка
                <span className="font-medium text-zinc-900">{rate}% годовых</span>
              </span>
              <input
                type="range"
                min={0}
                max={36}
                step={1}
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
                className="mt-1.5 w-full accent-zinc-900"
              />
            </label>
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Платёж в месяц</dt>
              <dd className="font-semibold">{formatPrice(plan.monthly)} сум</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Сумма кредита</dt>
              <dd>{formatPrice(plan.principal)} сум</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Переплата</dt>
              <dd>{formatPrice(plan.interest)} сум</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
            Расчёт предварительный: итоговые условия зависят от банка и подтверждения дохода.
          </p>
        </div>
      )}
    </div>
  );
}
