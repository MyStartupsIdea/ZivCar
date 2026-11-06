"use client";

import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { useCurrentAccount } from "@/lib/accounts";
import { useReviews } from "@/lib/reviews";

export function SellerCard({ sellerId, city }: { sellerId: string; city: string }) {
  const { accounts } = useCurrentAccount();
  const { summary } = useReviews(sellerId);
  const seller = accounts.find((item) => item.id === sellerId);

  if (!seller) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-5">
        <p className="text-[12px] uppercase tracking-[0.14em] text-zinc-400">Продавец</p>
        <p className="mt-1 text-[15px] font-medium">Частное лицо</p>
        <p className="text-[13px] text-zinc-500">{city}, Узбекистан</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-5">
      <p className="text-[12px] uppercase tracking-[0.14em] text-zinc-400">Продавец</p>
      <div className="mt-2 flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold"
          style={{
            backgroundColor: `hsl(${seller.hue} 65% 93%)`,
            color: `hsl(${seller.hue} 45% 32%)`,
          }}
        >
          {seller.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-[15px] font-medium">
            {seller.name}
            {seller.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-zinc-500" />}
          </p>
          <p className="text-[12px] text-zinc-500">
            {seller.type === "dealer" ? "Автосалон" : "Частное лицо"} · {seller.city}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[13px]">
        <Star className="h-3.5 w-3.5 fill-zinc-900 text-zinc-900" />
        <span className="font-medium">{summary.count > 0 ? summary.average.toFixed(1) : "—"}</span>
        <span className="text-zinc-400">
          {summary.count > 0 ? `· ${summary.count} отзыв(ов)` : "· пока без отзывов"}
        </span>
      </div>

      <Link
        href={`/sellers/${seller.id}`}
        className="mt-3 inline-flex text-[13px] text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline"
      >
        Профиль продавца
      </Link>

      <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">
        Не переводите предоплату до личной встречи. Проверяйте документы и VIN.
      </p>
    </div>
  );
}
