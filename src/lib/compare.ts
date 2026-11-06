"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "avto.compare.v1";
export const MAX_COMPARE = 4;

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_COMPARE)
      : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
  window.dispatchEvent(new Event("avto:compare-changed"));
}

export function useCompare(): {
  ids: string[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  full: boolean;
} {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIds(readIds());
      setReady(true);
    };
    sync();
    window.addEventListener("avto:compare-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:compare-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function toggle(id: string) {
    const current = readIds();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id].slice(0, MAX_COMPARE);
    persist(next);
  }

  return {
    ids,
    ready,
    has: (id: string) => ids.includes(id),
    toggle,
    remove: (id: string) => persist(readIds().filter((item) => item !== id)),
    clear: () => persist([]),
    full: ids.length >= MAX_COMPARE,
  };
}
