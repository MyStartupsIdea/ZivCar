"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus={autoFocus}
        placeholder="Марка, модель или город"
        aria-label="Поиск автомобилей"
        className="h-[52px] w-full rounded-full border border-zinc-200 bg-white pl-11 pr-28 text-[15px] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        Найти
      </button>
    </form>
  );
}
