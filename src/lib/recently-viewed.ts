"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "avto.recent.v1";
const MAX_ITEMS = 24;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_ITEMS)
      : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  window.dispatchEvent(new Event("avto:recent-changed"));
}

export function trackView(id: string): void {
  if (typeof window === "undefined" || !id) return;
  persist([id, ...readRecent().filter((item) => item !== id)]);
}

export function getRecent(): string[] {
  return readRecent();
}

export function clearRecent(): void {
  persist([]);
}

export function useRecent(): { ids: string[]; ready: boolean; clear: () => void } {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIds(readRecent());
      setReady(true);
    };
    sync();
    window.addEventListener("avto:recent-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:recent-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { ids, ready, clear: clearRecent };
}
