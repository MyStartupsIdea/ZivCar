"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Plus, UserRound } from "lucide-react";
import { useCurrentAccount } from "@/lib/accounts";

export function AccountMenu() {
  const { account, accounts, ready, switchTo, create } = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "Ташкент" });
  const [error, setError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Укажите имя");
      return;
    }
    create({
      name: form.name,
      phone: form.phone || "+998 90 000 00 00",
      city: form.city,
      type: "private",
    });
    setForm({ name: "", phone: "", city: "Ташкент" });
    setCreating(false);
    setError("");
    setOpen(false);
  }

  if (!ready) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-100" />;
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Профиль"
        className="flex items-center gap-1.5 rounded-full border border-zinc-200 py-1 pl-1 pr-2 transition-colors hover:border-zinc-300"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold"
          style={{
            backgroundColor: `hsl(${account?.hue ?? 220} 65% 93%)`,
            color: `hsl(${account?.hue ?? 220} 45% 32%)`,
          }}
        >
          {(account?.name ?? "Г").slice(0, 1).toUpperCase()}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-900/5">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Мой профиль</p>
            <p className="mt-1 text-[14px] font-medium">{account?.name ?? "Гость"}</p>
            <p className="text-[12px] text-zinc-500">{account?.city ?? "Узбекистан"}</p>
          </div>

          {!creating ? (
            <>
              <div className="max-h-64 overflow-y-auto py-1">
                {accounts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      switchTo(item.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-[13px] transition-colors hover:bg-zinc-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{item.name}</span>
                      <span className="text-[11px] text-zinc-400">
                        {item.type === "dealer" ? "Автосалон" : "Частное лицо"} · {item.city}
                      </span>
                    </span>
                    {account?.id === item.id && <Check className="h-4 w-4 shrink-0 text-zinc-900" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-zinc-100 p-2">
                <Link
                  href="/my"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  Мои объявления
                </Link>
                <Link
                  href="/saved"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  Сохранённые поиски
                </Link>
                <Link
                  href="/history"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  Вы смотрели
                </Link>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <UserRound className="h-4 w-4" />
                  Настройки профиля
                </Link>
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <Plus className="h-4 w-4" />
                  Создать профиль
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-2 p-3">
              <input
                autoFocus
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Имя и фамилия"
                aria-label="Имя"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:border-zinc-300"
              />
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="+998 90 000 00 00"
                aria-label="Телефон"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:border-zinc-300"
              />
              <select
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                aria-label="Город"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:border-zinc-300"
              >
                {["Ташкент", "Самарканд", "Бухара", "Наманган", "Андижан", "Фергана"].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {error && <p className="text-[12px] text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-zinc-900 py-2 text-[13px] font-medium text-white"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded-full border border-zinc-200 px-3 py-2 text-[13px]"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
