"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useCurrentAccount } from "@/lib/accounts";
import { useReviews } from "@/lib/reviews";

export function ReviewForm({ sellerId }: { sellerId: string }) {
  const { account, ready } = useCurrentAccount();
  const { submit } = useReviews(sellerId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  if (ready && (!account || account.id === sellerId)) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-3 text-[13px] text-zinc-500">
        {account?.id === sellerId
          ? "Отзывы о себе оставить нельзя."
          : "Войдите в профиль, чтобы оставить отзыв."}
      </p>
    );
  }

  if (sent) {
    return (
      <p className="rounded-2xl bg-zinc-50 px-4 py-3 text-[13px] text-zinc-600">
        Спасибо! Отзыв опубликован в профиле продавца.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!account || text.trim().length < 5) return;
        submit({
          authorId: account.id,
          authorName: account.name,
          rating,
          text,
        });
        setText("");
        setSent(true);
      }}
      className="rounded-2xl border border-zinc-200 p-4"
    >
      <p className="text-[13px] font-medium">Оставить отзыв</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} из 5`}
            aria-pressed={rating === value}
            className="p-0.5"
          >
            <Star
              className={`h-5 w-5 ${
                value <= rating ? "fill-zinc-900 text-zinc-900" : "text-zinc-300"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        maxLength={800}
        placeholder="Как прошла сделка? Что стоит знать другим покупателям?"
        className="mt-2 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:border-zinc-300"
      />
      <button
        type="submit"
        disabled={text.trim().length < 5}
        className="mt-2 w-full rounded-full bg-zinc-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
      >
        Отправить отзыв
      </button>
    </form>
  );
}
