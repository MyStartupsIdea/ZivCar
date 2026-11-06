"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, RotateCcw, Save } from "lucide-react";
import { useCurrentAccount, type AccountType } from "@/lib/accounts";
import { CITIES, listingsBySeller, useListings } from "@/lib/listings";
import { useUnreadCount } from "@/lib/messages";
import { useReviews } from "@/lib/reviews";
import { formatDate } from "@/lib/format";

export default function AccountPage() {
  const { account, accounts, ready, switchTo, update } = useCurrentAccount();
  const { listings } = useListings();
  const unread = useUnreadCount(account?.id ?? null);
  const { summary } = useReviews(account?.id ?? "");
  const [draft, setDraft] = useState<{
    name?: string;
    phone?: string;
    city?: string;
    bio?: string;
    type?: AccountType;
  } | null>(null);
  const [saved, setSaved] = useState(false);

  const own = account ? listingsBySeller(listings, account.id) : [];

  if (!ready || !account) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  const form = {
    name: draft?.name ?? account.name,
    phone: draft?.phone ?? account.phone,
    city: draft?.city ?? account.city,
    bio: draft?.bio ?? account.bio,
    type: draft?.type ?? account.type,
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-10">
      <h1 className="text-[26px] font-semibold tracking-tight sm:text-[32px]">Профиль</h1>
      <p className="mt-1 text-[13px] text-zinc-500">
        Прототип без паролей: профиль хранится в этом браузере, переключайтесь между аккаунтами для
        проверки сценариев покупателя и продавца.
      </p>

      <section className="mt-7 flex items-center gap-4 rounded-2xl border border-zinc-200 p-5">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-[20px] font-semibold"
          style={{
            backgroundColor: `hsl(${account.hue} 65% 93%)`,
            color: `hsl(${account.hue} 45% 32%)`,
          }}
        >
          {account.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-medium">{account.name}</p>
          <p className="text-[13px] text-zinc-500">
            {account.type === "dealer" ? "Автосалон" : "Частное лицо"} · {account.city}
          </p>
          <p className="text-[12px] text-zinc-400">На сайте с {formatDate(account.joined_at)}</p>
        </div>
        <Link
          href={`/sellers/${account.id}`}
          className="shrink-0 rounded-full border border-zinc-200 px-3.5 py-2 text-[12px] font-medium transition-colors hover:border-zinc-300"
        >
          Мой публичный профиль
        </Link>
      </section>

      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Объявлений", value: String(own.length) },
          { label: "Непрочитанных", value: String(unread) },
          { label: "Отзывов", value: String(summary.count) },
          { label: "Рейтинг", value: summary.count > 0 ? summary.average.toFixed(1) : "—" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-zinc-50 px-4 py-3">
            <dt className="text-[11px] uppercase tracking-[0.1em] text-zinc-400">{item.label}</dt>
            <dd className="mt-0.5 text-[17px] font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Данные профиля</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            update(account.id, form);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
          }}
          className="mt-3 space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[12px] text-zinc-500">
              Имя
              <input
                value={form.name}
                onChange={(event) => setDraft({ ...form, name: event.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-[14px] text-zinc-900 outline-none focus:border-zinc-300"
              />
            </label>
            <label className="block text-[12px] text-zinc-500">
              Телефон
              <input
                value={form.phone}
                onChange={(event) => setDraft({ ...form, phone: event.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-[14px] text-zinc-900 outline-none focus:border-zinc-300"
              />
            </label>
            <label className="block text-[12px] text-zinc-500">
              Город
              <select
                value={form.city}
                onChange={(event) => setDraft({ ...form, city: event.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-[14px] text-zinc-900 outline-none focus:border-zinc-300"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[12px] text-zinc-500">
              Тип продавца
              <select
                value={form.type}
                onChange={(event) =>
                  setDraft({ ...form, type: event.target.value as AccountType })
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-[14px] text-zinc-900 outline-none focus:border-zinc-300"
              >
                <option value="private">Частное лицо</option>
                <option value="dealer">Автосалон</option>
              </select>
            </label>
          </div>

          <label className="block text-[12px] text-zinc-500">
            О себе
            <textarea
              value={form.bio}
              onChange={(event) => setDraft({ ...form, bio: event.target.value })}
              rows={3}
              maxLength={400}
              className="mt-1 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-[14px] text-zinc-900 outline-none focus:border-zinc-300"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Сохранено" : "Сохранить"}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Переключить профиль</h2>
        <ul className="mt-3 divide-y divide-zinc-100">
          {accounts.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">{item.name}</p>
                <p className="text-[12px] text-zinc-500">
                  {item.type === "dealer" ? "Автосалон" : "Частное лицо"} · {item.city}
                </p>
              </div>
              {item.id === account.id ? (
                <span className="inline-flex items-center gap-1 text-[12px] text-zinc-500">
                  <Check className="h-3.5 w-3.5" /> Активный
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => switchTo(item.id)}
                  className="rounded-full border border-zinc-200 px-3 py-1.5 text-[12px] transition-colors hover:border-zinc-300"
                >
                  Войти
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 p-5">
        <h2 className="text-[15px] font-medium">Демо-данные</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Можно вернуть площадку к исходному состоянию: демонстрационные объявления, переписка,
          отзывы и профили. Ваши карточки будут удалены.
        </p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm("Сбросить все локальные данные площадки?")) return;
            Object.keys(window.localStorage)
              .filter((key) => key.startsWith("avto."))
              .forEach((key) => window.localStorage.removeItem(key));
            window.location.reload();
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-[13px] transition-colors hover:border-red-200 hover:text-red-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Сбросить демо-данные
        </button>
      </section>
    </div>
  );
}
