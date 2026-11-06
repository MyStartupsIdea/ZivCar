"use client";

import Link from "next/link";
import { Eye, MessageCircle, Plus } from "lucide-react";
import { CarArt } from "@/components/CarArt";
import { useCurrentAccount } from "@/lib/accounts";
import {
  deleteListing,
  listingsBySeller,
  markAvailable,
  markSold,
  togglePublished,
  useListings,
} from "@/lib/listings";
import { useUnreadCount } from "@/lib/messages";
import { formatPrice, timeAgo } from "@/lib/format";

export default function MyListingsPage() {
  const { account, ready: accountReady } = useCurrentAccount();
  const { listings, ready } = useListings();
  const unread = useUnreadCount(account?.id ?? null);
  const own = account ? listingsBySeller(listings, account.id) : [];

  const active = own.filter((item) => item.published);
  const sold = own.filter((item) => !item.published && item.sold_at);
  const views = own.reduce((sum, item) => sum + item.views, 0);
  const loading = !ready || !accountReady;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Мои объявления</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {account ? `${account.name} · ${account.city}` : "Профиль не выбран"}
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
          Разместить
        </Link>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "В продаже", value: String(active.length) },
          { label: "Продано", value: String(sold.length) },
          { label: "Просмотры", value: String(views) },
          { label: "Сообщения", value: String(unread) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-zinc-50 px-4 py-3">
            <dt className="text-[11px] uppercase tracking-[0.1em] text-zinc-400">{stat.label}</dt>
            <dd className="mt-0.5 text-[18px] font-semibold tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {unread > 0 && (
        <Link
          href="/messages"
          className="mt-3 flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-[13px] text-white"
        >
          <MessageCircle className="h-4 w-4" />
          {unread} непрочитанных сообщени(я) — ответить
        </Link>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : own.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <p className="text-[15px] font-medium">У этого профиля пока нет объявлений</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">
            Создайте карточку: фото, название, описание — и она появится в каталоге.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/new"
              className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Создать карточку
            </Link>
            <Link
              href="/account"
              className="inline-flex rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium"
            >
              Сменить профиль
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-100">
          {own.map((listing) => {
            const status = listing.sold_at
              ? { label: "Продано", tone: "bg-zinc-900 text-white" }
              : listing.published
                ? { label: "Активно", tone: "bg-emerald-50 text-emerald-700" }
                : { label: "Снято", tone: "bg-zinc-100 text-zinc-500" };

            return (
              <li key={listing.id} className="flex gap-4 py-4">
                <Link
                  href={`/ads/${listing.id}`}
                  className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100"
                >
                  {listing.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CarArt seed={listing.id} label={listing.title} className="h-full w-full" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/ads/${listing.id}`}
                      className="truncate text-[15px] font-medium tracking-tight transition-colors hover:text-zinc-600"
                    >
                      {listing.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-zinc-500">
                    {formatPrice(listing.price)} сум · {listing.city}
                  </p>
                  <p className="mt-1 flex items-center gap-3 text-[12px] text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {listing.views}
                    </span>
                    <span>{timeAgo(listing.created_at)}</span>
                  </p>

                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                    <Link
                      href={`/ads/${listing.id}/edit`}
                      className="text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      Изменить
                    </Link>
                    {listing.sold_at ? (
                      <button
                        type="button"
                        onClick={() => markAvailable(listing.id)}
                        className="text-zinc-500 transition-colors hover:text-zinc-900"
                      >
                        Вернуть в продажу
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => markSold(listing.id)}
                          className="text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                          Отметить проданным
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePublished(listing.id)}
                          className="text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                          {listing.published ? "Снять" : "Опубликовать"}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Удалить карточку? Действие нельзя отменить.")) {
                          deleteListing(listing.id);
                        }
                      }}
                      className="text-zinc-400 transition-colors hover:text-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
