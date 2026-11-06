"use client";

import { useCallback, useEffect, useState } from "react";

export type AccountType = "private" | "dealer";

export type Account = {
  id: string;
  name: string;
  phone: string;
  city: string;
  type: AccountType;
  bio: string;
  verified: boolean;
  joined_at: string;
  hue: number;
};

export type AccountInput = {
  name: string;
  phone: string;
  city: string;
  type: AccountType;
  bio?: string;
};

const ACCOUNTS_KEY = "avto.accounts.v1";
const CURRENT_KEY = "avto.current-account.v1";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: "u-aziz",
    name: "Азиз Каримов",
    phone: "+998 90 123 45 67",
    city: "Ташкент",
    type: "private",
    bio: "Продаю свои машины, всегда честно рассказываю о состоянии.",
    verified: true,
    joined_at: daysAgo(420),
    hue: 212,
  },
  {
    id: "u-dilnoza",
    name: "Дилноза Юсупова",
    phone: "+998 91 234 56 78",
    city: "Ташкент",
    type: "private",
    bio: "Ищу машину для семьи, отвечаю быстро.",
    verified: true,
    joined_at: daysAgo(260),
    hue: 338,
  },
  {
    id: "u-rustam",
    name: "Рустам Ахмедов",
    phone: "+998 93 345 67 89",
    city: "Самарканд",
    type: "private",
    bio: "Автомобилист с 15-летним стажем. Помогу с осмотром.",
    verified: false,
    joined_at: daysAgo(180),
    hue: 154,
  },
  {
    id: "u-dealer",
    name: "AutoTrade Uzbekistan",
    phone: "+998 71 200 10 10",
    city: "Ташкент",
    type: "dealer",
    bio: "Площадка проверенных автомобилей с гарантией юридической чистоты.",
    verified: true,
    joined_at: daysAgo(900),
    hue: 28,
  },
];

function isAccount(value: unknown): value is Account {
  if (typeof value !== "object" || value === null) return false;
  const account = value as Account;
  return typeof account.id === "string" && typeof account.name === "string";
}

function readAccounts(): Account[] {
  if (typeof window === "undefined") return DEMO_ACCOUNTS;
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEMO_ACCOUNTS));
      return DEMO_ACCOUNTS;
    }
    const parsed: unknown = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed.filter(isAccount) : [];
    return list.length > 0 ? list : DEMO_ACCOUNTS;
  } catch {
    return DEMO_ACCOUNTS;
  }
}

function persistAccounts(accounts: Account[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  window.dispatchEvent(new Event("avto:accounts-changed"));
}

function notifyCurrentChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("avto:current-account-changed"));
}

export function getAccounts(): Account[] {
  return readAccounts();
}

export function getAccount(id: string): Account | null {
  return readAccounts().find((account) => account.id === id) ?? null;
}

export function getCurrentAccountId(): string {
  if (typeof window === "undefined") return DEMO_ACCOUNTS[0].id;
  const accounts = readAccounts();
  const stored = window.localStorage.getItem(CURRENT_KEY);
  if (stored && accounts.some((account) => account.id === stored)) return stored;
  return accounts[0]?.id ?? DEMO_ACCOUNTS[0].id;
}

export function getCurrentAccount(): Account | null {
  return getAccount(getCurrentAccountId());
}

export function useCurrentAccount(): {
  account: Account | null;
  accounts: Account[];
  ready: boolean;
  switchTo: (id: string) => void;
  create: (input: AccountInput) => Account;
  update: (id: string, patch: Partial<AccountInput>) => void;
} {
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const list = readAccounts();
      setAccounts(list);
      setAccount(list.find((item) => item.id === getCurrentAccountId()) ?? list[0] ?? null);
      setReady(true);
    };
    sync();
    window.addEventListener("avto:accounts-changed", sync);
    window.addEventListener("avto:current-account-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:accounts-changed", sync);
      window.removeEventListener("avto:current-account-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const switchTo = useCallback((id: string) => {
    window.localStorage.setItem(CURRENT_KEY, id);
    notifyCurrentChanged();
  }, []);

  const create = useCallback((input: AccountInput) => {
    const list = readAccounts();
    const account: Account = {
      id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      phone: input.phone.trim(),
      city: input.city.trim(),
      type: input.type,
      bio: input.bio?.trim() ?? "",
      verified: false,
      joined_at: new Date().toISOString(),
      hue: Math.floor(Math.random() * 360),
    };
    persistAccounts([...list, account]);
    window.localStorage.setItem(CURRENT_KEY, account.id);
    notifyCurrentChanged();
    return account;
  }, []);

  const update = useCallback((id: string, patch: Partial<AccountInput>) => {
    persistAccounts(
      readAccounts().map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  return { account, accounts, ready, switchTo, create, update };
}
