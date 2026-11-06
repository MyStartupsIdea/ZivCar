"use client";

import { useEffect, useState } from "react";

export type CheckItem = { id: string; label: string; hint: string };
export type CheckGroup = { group: string; items: CheckItem[] };

export const CHECKLIST: CheckGroup[] = [
  {
    group: "Документы",
    items: [
      { id: "doc-tech", label: "Техпаспорт и свидетельство о регистрации", hint: "Сверьте VIN, номер кузова и данные владельца" },
      { id: "doc-owners", label: "Число владельцев совпадает с рассказом", hint: "Больше трёх владельцев за короткий срок — повод насторожиться" },
      { id: "doc-debts", label: "Нет штрафов, залогов и арестов", hint: "Проверьте на портале госуслуг или у нотариуса" },
      { id: "doc-service", label: "Сервисная книжка и чеки на ТО", hint: "История обслуживания подтверждает пробег" },
    ],
  },
  {
    group: "Кузов и салон",
    items: [
      { id: "body-gaps", label: "Зазоры кузова одинаковые", hint: "Разные зазоры — след ремонта после ДТП" },
      { id: "body-paint", label: "Нет разницы оттенков и подтёков краски", hint: "Смотрите при дневном свете, сбоку" },
      { id: "body-glass", label: "Стёкла и фары одного года с машиной", hint: "Маркировка стекла содержит год выпуска" },
      { id: "body-interior", label: "Салон без запаха сырости и гари", hint: "Запах может скрывать затопление или утечку" },
    ],
  },
  {
    group: "Техника",
    items: [
      { id: "tech-engine", label: "Двигатель без потеков и посторонних шумов", hint: "Заведите на холодную, послушайте 2–3 минуты" },
      { id: "tech-gearbox", label: "Коробка переключается плавно", hint: "Проверьте на подъёме и при разгоне" },
      { id: "tech-susp", label: "Подвеска не стучит на неровностях", hint: "Проедьте по лежачему полицейскому" },
      { id: "tech-electronics", label: "Электрика, кондиционер и мультимедиа работают", hint: "Проверьте все кнопки и стеклоподъёмники" },
      { id: "tech-tires", label: "Шины и диски без повреждений", hint: "Износ должен быть равномерным" },
    ],
  },
  {
    group: "Сделка",
    items: [
      { id: "deal-vin", label: "VIN на кузове совпадает с документами", hint: "Фото VIN сохраните себе" },
      { id: "deal-contract", label: "Договор купли-продажи оформлен официально", hint: "Три экземпляра, подписи и суммы" },
      { id: "deal-payment", label: "Оплата после подписания и передачи ключей", hint: "Никакой предоплаты до личной встречи" },
      { id: "deal-transfer", label: "Переоформление в тот же день", hint: "Проверьте запись в техпаспорте" },
    ],
  },
];

export const TOTAL_CHECKS = CHECKLIST.reduce((sum, group) => sum + group.items.length, 0);

const STORAGE_KEY = "avto.checklist.v1";

function readChecked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("avto:checklist-changed"));
}

export function useChecklist(): {
  checked: string[];
  ready: boolean;
  toggle: (id: string) => void;
  reset: () => void;
  progress: number;
} {
  const [checked, setChecked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setChecked(readChecked());
      setReady(true);
    };
    sync();
    window.addEventListener("avto:checklist-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("avto:checklist-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function toggle(id: string) {
    const current = readChecked();
    persist(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return {
    checked,
    ready,
    toggle,
    reset: () => persist([]),
    progress: Math.round((checked.length / TOTAL_CHECKS) * 100),
  };
}
