"use client";

import { useEffect, useMemo, useState } from "react";

export type Thread = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  created_at: string;
  readBy: string[];
};

const THREADS_KEY = "avto.threads.v1";
const MESSAGES_KEY = "avto.messages.v1";
const CHANGED_EVENT = "avto:messages-changed";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const SEED_THREADS: Thread[] = [
  {
    id: "th-cobalt",
    listingId: "demo-cobalt",
    buyerId: "u-dilnoza",
    sellerId: "u-aziz",
    created_at: minutesAgo(320),
    updated_at: minutesAgo(45),
  },
  {
    id: "th-camry",
    listingId: "demo-camry",
    buyerId: "u-aziz",
    sellerId: "u-rustam",
    created_at: minutesAgo(1500),
    updated_at: minutesAgo(260),
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: "m-1",
    threadId: "th-cobalt",
    senderId: "u-dilnoza",
    text: "Здравствуйте! Cobalt ещё в продаже?",
    created_at: minutesAgo(320),
    readBy: ["u-dilnoza", "u-aziz"],
  },
  {
    id: "m-2",
    threadId: "th-cobalt",
    senderId: "u-aziz",
    text: "Здравствуйте, да. Машина в Ташкенте, можно посмотреть сегодня после 18:00.",
    created_at: minutesAgo(300),
    readBy: ["u-dilnoza", "u-aziz"],
  },
  {
    id: "m-3",
    threadId: "th-cobalt",
    senderId: "u-dilnoza",
    text: "Отлично, а торг возможен? И подскажите, сколько владельцев по документам?",
    created_at: minutesAgo(45),
    readBy: ["u-dilnoza"],
  },
  {
    id: "m-4",
    threadId: "th-camry",
    senderId: "u-aziz",
    text: "Добрый день! Camry 2019 актуальна? Готов приехать на осмотр в выходные.",
    created_at: minutesAgo(1500),
    readBy: ["u-aziz", "u-rustam"],
  },
  {
    id: "m-5",
    threadId: "th-camry",
    senderId: "u-rustam",
    text: "Да, актуальна. В субботу буду в городе, наберите заранее.",
    created_at: minutesAgo(260),
    readBy: ["u-aziz", "u-rustam"],
  },
];

function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function readThreads(): Thread[] {
  return readList<Thread>(THREADS_KEY, SEED_THREADS);
}

function readMessages(): Message[] {
  return readList<Message>(MESSAGES_KEY, SEED_MESSAGES);
}

function persistThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function persistMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function getThreads(): Thread[] {
  return readThreads()
    .slice()
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getThread(id: string): Thread | null {
  return readThreads().find((thread) => thread.id === id) ?? null;
}

export function getMessages(threadId: string): Message[] {
  return readMessages()
    .filter((message) => message.threadId === threadId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function threadUnread(threadId: string, accountId: string): number {
  return readMessages().filter(
    (message) =>
      message.threadId === threadId &&
      message.senderId !== accountId &&
      !message.readBy.includes(accountId)
  ).length;
}

export function unreadCount(accountId: string): number {
  return readThreads()
    .filter((thread) => thread.buyerId === accountId || thread.sellerId === accountId)
    .reduce((sum, thread) => sum + threadUnread(thread.id, accountId), 0);
}

export function openThread(listingId: string, buyerId: string, sellerId: string): string {
  const existing = readThreads().find(
    (thread) =>
      thread.listingId === listingId &&
      thread.buyerId === buyerId &&
      thread.sellerId === sellerId
  );
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const thread: Thread = {
    id: `th-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    listingId,
    buyerId,
    sellerId,
    created_at: now,
    updated_at: now,
  };
  persistThreads([thread, ...readThreads()]);
  return thread.id;
}

export function sendMessage(threadId: string, senderId: string, text: string): Message | null {
  const body = text.trim();
  if (!body) return null;
  const thread = getThread(threadId);
  if (!thread) return null;

  const message: Message = {
    id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    threadId,
    senderId,
    text: body.slice(0, 2000),
    created_at: new Date().toISOString(),
    readBy: [senderId],
  };

  persistMessages([...readMessages(), message]);
  persistThreads(
    readThreads().map((item) =>
      item.id === threadId ? { ...item, updated_at: message.created_at } : item
    )
  );
  return message;
}

export function markThreadRead(threadId: string, accountId: string): void {
  let changed = false;
  const next = readMessages().map((message) => {
    if (
      message.threadId === threadId &&
      message.senderId !== accountId &&
      !message.readBy.includes(accountId)
    ) {
      changed = true;
      return { ...message, readBy: [...message.readBy, accountId] };
    }
    return message;
  });
  if (changed) persistMessages(next);
}

export function deleteThread(threadId: string): void {
  persistThreads(readThreads().filter((thread) => thread.id !== threadId));
  persistMessages(readMessages().filter((message) => message.threadId !== threadId));
}

function subscribe(sync: () => void): () => void {
  sync();
  window.addEventListener(CHANGED_EVENT, sync);
  window.addEventListener("storage", sync);
  return () => {
    window.removeEventListener(CHANGED_EVENT, sync);
    window.removeEventListener("storage", sync);
  };
}

export function useThreads(accountId: string | null): { threads: Thread[]; ready: boolean } {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setThreads(
        accountId
          ? getThreads().filter(
              (thread) => thread.buyerId === accountId || thread.sellerId === accountId
            )
          : []
      );
      setReady(true);
    };
    return subscribe(sync);
  }, [accountId]);

  return { threads, ready };
}

export function useThread(
  threadId: string,
  accountId: string | null
): { thread: Thread | null; messages: Message[]; ready: boolean } {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setThread(getThread(threadId));
      setMessages(getMessages(threadId));
      setReady(true);
    };
    return subscribe(sync);
  }, [threadId]);

  useEffect(() => {
    if (accountId) markThreadRead(threadId, accountId);
  }, [threadId, accountId, messages.length]);

  return { thread, messages, ready };
}

export function useUnreadCount(accountId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(accountId ? unreadCount(accountId) : 0);
    return subscribe(sync);
  }, [accountId]);

  return count;
}

export function useThreadPreviews(
  accountId: string | null
): { threadId: string; last: Message | null; unread: number }[] {
  const { threads } = useThreads(accountId);
  return useMemo(
    () =>
      threads.map((thread) => {
        const messages = getMessages(thread.id);
        return {
          threadId: thread.id,
          last: messages[messages.length - 1] ?? null,
          unread: accountId ? threadUnread(thread.id, accountId) : 0,
        };
      }),
    [threads, accountId]
  );
}
