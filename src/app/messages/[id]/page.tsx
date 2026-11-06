"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useCurrentAccount } from "@/lib/accounts";
import { sendMessage, useThread } from "@/lib/messages";
import { useListings } from "@/lib/listings";
import { formatPrice, timeAgo } from "@/lib/format";

function ThreadView() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const { account, accounts, ready } = useCurrentAccount();
  const { thread, messages, ready: threadReady } = useThread(id, account?.id ?? null);
  const { listings } = useListings();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (!ready || !threadReady) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="h-10 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Диалог не найден</p>
        <Link
          href="/messages"
          className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Все сообщения
        </Link>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Нужен профиль</p>
        <p className="mt-1 text-sm text-zinc-500">Выберите, от чьего имени открыть переписку.</p>
        <Link
          href="/account"
          className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Открыть профиль
        </Link>
      </div>
    );
  }

  const participant = thread.buyerId === account.id || thread.sellerId === account.id;
  if (!participant) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Нет доступа к диалогу</p>
        <p className="mt-1 text-sm text-zinc-500">
          Этот чат доступен только покупателю и продавцу.
        </p>
        <Link
          href="/messages"
          className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Мои сообщения
        </Link>
      </div>
    );
  }

  const peerId = thread.buyerId === account.id ? thread.sellerId : thread.buyerId;
  const peer = accounts.find((item) => item.id === peerId);
  const listing = listings.find((item) => item.id === thread.listingId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-5 pb-10 pt-6">
      <Link
        href="/messages"
        className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Все сообщения
      </Link>

      <div className="mt-3 flex items-center gap-3 border-b border-zinc-100 pb-4">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold"
          style={{
            backgroundColor: `hsl(${peer?.hue ?? 220} 65% 93%)`,
            color: `hsl(${peer?.hue ?? 220} 45% 32%)`,
          }}
        >
          {(peer?.name ?? "?").slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{peer?.name ?? "Пользователь"}</p>
          {listing ? (
            <Link
              href={`/ads/${listing.id}`}
              className="truncate text-[12px] text-zinc-500 transition-colors hover:text-zinc-900"
            >
              {listing.title} · {formatPrice(listing.price)} сум
            </Link>
          ) : (
            <p className="text-[12px] text-zinc-400">Объявление удалено</p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-5">
        {messages.length === 0 && (
          <p className="py-10 text-center text-[13px] text-zinc-400">
            Сообщений пока нет — напишите первым.
          </p>
        )}
        {messages.map((message) => {
          const own = message.senderId === account.id;
          return (
            <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                  own ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800"
                }`}
              >
                <p className="whitespace-pre-line break-words">{message.text}</p>
                <p
                  className={`mt-1 text-[10px] ${own ? "text-white/60" : "text-zinc-400"}`}
                >
                  {timeAgo(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const sent = sendMessage(thread.id, account.id, text);
          if (sent) setText("");
        }}
        className="sticky bottom-4 flex gap-2 rounded-full border border-zinc-200 bg-white p-1.5 shadow-sm"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Напишите сообщение…"
          aria-label="Текст сообщения"
          maxLength={2000}
          className="min-w-0 flex-1 bg-transparent px-3 text-[14px] outline-none"
        />
        <button
          type="submit"
          disabled={text.trim().length === 0}
          aria-label="Отправить"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default function ThreadPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-3xl px-5 py-16 text-sm text-zinc-400">Загрузка…</div>}
    >
      <ThreadView />
    </Suspense>
  );
}
