"use client";

import Link from "next/link";
import { Car, Heart, MessageCircle, Scale } from "lucide-react";
import { AccountMenu } from "@/components/AccountMenu";
import { useCurrentAccount } from "@/lib/accounts";
import { useUnreadCount } from "@/lib/messages";
import { useCompare } from "@/lib/compare";

export function Header() {
  const { account } = useCurrentAccount();
  const unread = useUnreadCount(account?.id ?? null);
  const { ids: compareIds } = useCompare();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-7">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="avto.uz — на главную">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Car className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-[17px] font-semibold tracking-tight">
              avto<span className="text-zinc-400">.uz</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-5 text-sm text-zinc-500 md:flex"
            aria-label="Навигация"
          >
            <Link href="/search" className="transition-colors hover:text-zinc-900">
              Каталог
            </Link>
            <Link href="/dealers" className="transition-colors hover:text-zinc-900">
              Продавцы
            </Link>
            <Link href="/analytics" className="transition-colors hover:text-zinc-900">
              Аналитика
            </Link>
            <Link
              href="/messages"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-900"
            >
              Сообщения
              {unread > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Link href="/favorites" className="transition-colors hover:text-zinc-900">
              Избранное
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/compare"
            aria-label="Сравнение"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Scale className="h-[18px] w-[18px]" />
            {compareIds.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] text-white">
                {compareIds.length}
              </span>
            )}
          </Link>

          <Link
            href="/messages"
            aria-label="Сообщения"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] text-white">
                {unread}
              </span>
            )}
          </Link>

          <Link
            href="/favorites"
            aria-label="Избранное"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
          >
            <Heart className="h-[18px] w-[18px]" />
          </Link>

          <AccountMenu />

          <Link
            href="/new"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Разместить
          </Link>
        </div>
      </div>
    </header>
  );
}
