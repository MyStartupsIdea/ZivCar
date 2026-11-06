"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/listings";

export function FavoriteButton({
  id,
  className = "",
  size = "sm",
}: {
  id: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  const { has, toggle } = useFavorites();
  const active = has(id);

  return (
    <button
      type="button"
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(id);
      }}
      className={`flex items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm backdrop-blur transition hover:text-zinc-900 ${
        size === "lg" ? "h-10 w-10" : "h-8 w-8"
      } ${className}`}
    >
      <Heart
        className={`${size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4"} ${
          active ? "fill-zinc-900 text-zinc-900" : ""
        }`}
      />
    </button>
  );
}
