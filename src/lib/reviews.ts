"use client";

import { useEffect, useState } from "react";

export type Review = {
  id: string;
  sellerId: string;
  authorId: string;
  authorName: string;
  rating: number;
  text: string;
  created_at: string;
};

const STORAGE_KEY = "avto.reviews.v1";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

const SEED: Review[] = [
  {
    id: "r-1",
    sellerId: "u-aziz",
    authorId: "u-dilnoza",
    authorName: "Дилноза Ю.",
    rating: 5,
    text: "Машина полностью совпала с описанием, документы готовы, встреча прошла спокойно.",
    created_at: daysAgo(12),
  },
  {
    id: "r-2",
    sellerId: "u-aziz",
    authorId: "u-rustam",
    authorName: "Рустам А.",
    rating: 5,
    text: "Отвечает быстро, показал все мелкие недостатки сам. Приятно иметь дело.",
    created_at: daysAgo(48),
  },
  {
    id: "r-3",
    sellerId: "u-dealer",
    authorId: "u-dilnoza",
    authorName: "Дилноза Ю.",
    rating: 4,
    text: "Большой выбор, помогли с оформлением. Очередь на выдачу была дольше обещанного.",
    created_at: daysAgo(30),
  },
  {
    id: "r-4",
    sellerId: "u-rustam",
    authorId: "u-aziz",
    authorName: "Азиз К.",
    rating: 5,
    text: "Договорились за один звонок, всё честно.",
    created_at: daysAgo(80),
  },
];

function readReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED;
    const list = parsed.filter(
      (item): item is Review =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Review).id === "string" &&
        typeof (item as Review).rating === "number"
    );
    return list.length > 0 ? list : SEED;
  } catch {
    return SEED;
  }
}

function persist(reviews: Review[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event("avto:reviews-changed"));
}

export function getReviews(sellerId: string): Review[] {
  return readReviews()
    .filter((review) => review.sellerId === sellerId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function ratingSummary(reviews: Review[]): { average: number; count: number } {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

export function addReview(input: {
  sellerId: string;
  authorId: string;
  authorName: string;
  rating: number;
  text: string;
}): Review {
  const review: Review = {
    id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    sellerId: input.sellerId,
    authorId: input.authorId,
    authorName: input.authorName,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    text: input.text.trim().slice(0, 800),
    created_at: new Date().toISOString(),
  };
  persist([review, ...readReviews()]);
  return review;
}

export function useReviews(sellerId: string): {
  reviews: Review[];
  ready: boolean;
  summary: { average: number; count: number };
  submit: (input: { authorId: string; authorName: string; rating: number; text: string }) => void;
} {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setReviews(getReviews(sellerId));
      setReady(true);
    };
    sync();
    window.addEventListener("avto:reviews-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:reviews-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sellerId]);

  return {
    reviews,
    ready,
    summary: ratingSummary(reviews),
    submit: (input) => addReview({ sellerId, ...input }),
  };
}
