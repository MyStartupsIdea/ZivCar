"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useCurrentAccount } from "@/lib/accounts";
import { useThreadPreviews, useThreads } from "@/lib/messages";
import { useListings } from "@/lib/listings";
import { timeAgo } from "@/lib/format";

export default function MessagesPage() {
  const { account, accounts, ready } = useCurrentAccount();
  const { threads, ready: threadsReady } = useThreads(account?.id ?? null);
  const previews = useThreadPreviews(account?.id ?? null);
  const { listings } = useListings();

  const rows = threads.map((thread, index) => {
    const peerId = thread.buyerId === account?.id ? thread.sellerId : thread.buyerId;
    const peer = accounts.find((item) => item.id === peerId);
    const listing = listings.find((item) => item.id === thread.listingId);
    return { thread, peer, listing, preview: previews[index] };
  });

  const loading = !ready || !threadsReady;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-10">
      <h1 className="text-[26px] font-semibold tracking-tight sm:text-[32px]">Сообщения</h1>
      <p className="mt-1 text-[13px] text-zinc-500">
        Переписка по объявлениям. Отвечайте сразу — покупатели чаще всего пишут первым трём продавцам.
      </p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <MessageCircle className="mx-auto h-6 w-6 text-zinc-300" />
          <p className="mt-3 text-[15px] font-medium">Пока нет переписки</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">
            Откройте объявление и нажмите «Написать продавцу» — диалог появится здесь.
          </p>
          <Link
            href="/search"
            className="mt-5 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-100">
          {rows.map(({ thread, peer, listing, preview }) => (
            <li key={thread.id}>
              <Link
                href={`/messages/${thread.id}`}
                className="flex items-center gap-3 py-4 transition-colors hover:bg-zinc-50/60"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold"
                  style={{
                    backgroundColor: `hsl(${peer?.hue ?? 220} 65% 93%)`,
                    color: `hsl(${peer?.hue ?? 220} 45% 32%)`,
                  }}
                >
                  {(peer?.name ?? "?").slice(0, 1).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[14px] font-medium">{peer?.name ?? "Пользователь"}</p>
                    <span className="shrink-0 text-[11px] text-zinc-400">
                      {preview?.last ? timeAgo(preview.last.created_at) : ""}
                    </span>
                  </div>
                  <p className="truncate text-[12px] text-zinc-500">
                    {listing?.title ?? "Объявление удалено"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 truncate text-[13px] text-zinc-600">
                    {preview?.last?.text ?? "Нет сообщений"}
                  </p>
                </div>

                {preview && preview.unread > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] text-white">
                    {preview.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
