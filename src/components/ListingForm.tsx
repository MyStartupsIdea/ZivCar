"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import {
  BODY_LABELS,
  CITIES,
  CONDITION_LABELS,
  FUEL_LABELS,
  MAX_PHOTOS,
  TRANSMISSION_LABELS,
  createListing,
  updateListing,
  type BodyType,
  type Condition,
  type Fuel,
  type Listing,
  type ListingInput,
  type Transmission,
} from "@/lib/listings";
import { compressImage } from "@/lib/image";
import { digitsOnly, formatPrice } from "@/lib/format";

const STEPS = ["Фотографии", "Название", "Описание"];

type Draft = {
  photos: string[];
  title: string;
  price: string;
  city: string;
  year: string;
  mileage: string;
  condition: Condition | "";
  fuel: Fuel | "";
  transmission: Transmission | "";
  body: BodyType | "";
  description: string;
  phone: string;
};

function initialDraft(listing?: Listing): Draft {
  return {
    photos: listing?.photos ?? [],
    title: listing?.title ?? "",
    price: listing ? String(listing.price) : "",
    city: listing?.city ?? "Ташкент",
    year: listing?.year != null ? String(listing.year) : "",
    mileage: listing?.mileage != null ? String(listing.mileage) : "",
    condition: listing?.condition ?? "",
    fuel: listing?.fuel ?? "",
    transmission: listing?.transmission ?? "",
    body: listing?.body ?? "",
    description: listing?.description ?? "",
    phone: listing?.phone ?? "",
  };
}

function normalizePhone(value: string): string {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
}

export function ListingForm({ initial }: { initial?: Listing }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => initialDraft(initial));
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showDetails, setShowDetails] = useState(
    Boolean(initial?.year || initial?.mileage || initial?.condition)
  );
  const fileRef = useRef<HTMLInputElement>(null);

  function patch(next: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...next }));
    setError(null);
  }

  async function addFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) {
      setError("Можно загрузить только изображения");
      return;
    }

    const free = MAX_PHOTOS - draft.photos.length;
    if (free <= 0) {
      setError(`Максимум ${MAX_PHOTOS} фотографий`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const encoded: string[] = [];
      for (const file of images.slice(0, free)) {
        encoded.push(await compressImage(file));
      }
      setDraft((current) => ({
        ...current,
        photos: [...current.photos, ...encoded].slice(0, MAX_PHOTOS),
      }));
      if (images.length > free) {
        setError(`Добавлено ${free} из ${images.length}: максимум ${MAX_PHOTOS} фото`);
      }
    } catch {
      setError("Не удалось обработать фотографию. Попробуйте другую.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    setDraft((current) => ({
      ...current,
      photos: current.photos.filter((_, position) => position !== index),
    }));
  }

  function next() {
    if (step === 0 && draft.photos.length === 0) {
      setError("Добавьте хотя бы одну фотографию");
      return;
    }
    if (step === 1) {
      if (draft.title.trim().length < 3) {
        setError("Введите название — например, Chevrolet Cobalt 2022");
        return;
      }
      if (!draft.price || Number(draft.price) <= 0) {
        setError("Укажите цену в сумах");
        return;
      }
    }
    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (step < STEPS.length - 1) return;
    if (draft.description.trim().length < 10) {
      setError("Опишите автомобиль хотя бы в двух предложениях");
      return;
    }

    const title = draft.title.trim();
    const payload: ListingInput = {
      title,
      description: draft.description.trim(),
      price: Number(draft.price),
      city: draft.city,
      brand: title.split(/\s+/)[0] ?? "",
      model: title.split(/\s+/).slice(1).join(" "),
      year: draft.year ? Number(draft.year) : null,
      mileage: draft.mileage ? Number(digitsOnly(draft.mileage)) : null,
      condition: (draft.condition || "used") as Condition,
      fuel: (draft.fuel || null) as Fuel | null,
      transmission: (draft.transmission || null) as Transmission | null,
      body: (draft.body || null) as BodyType | null,
      drive: null,
      color: null,
      engine: null,
      owners: null,
      negotiable: true,
      exchange: false,
      phone: normalizePhone(draft.phone),
      photos: draft.photos,
    };

    setSaving(true);
    setError(null);
    try {
      const saved = initial ? updateListing(initial.id, payload) : createListing(payload);
      if (!saved) throw new Error("not found");
      router.push(`/ads/${saved.id}`);
    } catch {
      setError("Не удалось сохранить карточку. Возможно, закончилось место в браузере.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl px-5 py-10 sm:py-14" noValidate>
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-zinc-400">
          Шаг {step + 1} из {STEPS.length}
        </p>
        {initial && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500">
            Редактирование
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-1.5">
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index <= step ? "bg-zinc-900" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      <h1 className="mt-8 text-[26px] font-semibold tracking-tight sm:text-[32px]">
        {initial ? "Редактировать карточку" : "Новое объявление"}
      </h1>
      <p className="mt-1 text-[15px] text-zinc-500">{STEPS[step]}</p>

      <div className="mt-8 animate-in" key={step}>
        {step === 0 && (
          <div>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void addFiles(event.dataTransfer.files);
              }}
              className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors ${
                dragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
              </span>
              <p className="mt-4 text-[15px] font-medium">
                {uploading ? "Обрабатываем фото…" : "Перетащите фото сюда"}
              </p>
              <p className="mt-1 text-[13px] text-zinc-500">
                JPG, PNG или WebP · до {MAX_PHOTOS} штук
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-4 rounded-full border border-zinc-200 px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-300 disabled:opacity-50"
              >
                Выбрать файлы
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) void addFiles(event.target.files);
                event.target.value = "";
              }}
            />

            {draft.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {draft.photos.map((photo, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Фото ${index + 1}`} className="h-full w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-zinc-600 backdrop-blur">
                        Обложка
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label={`Удалить фото ${index + 1}`}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm transition hover:bg-white hover:text-zinc-900"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-[13px] font-medium text-zinc-600">
                Название
              </label>
              <input
                id="title"
                value={draft.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder="Chevrolet Cobalt 2022"
                autoFocus
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
              />
            </div>

            <div>
              <label htmlFor="price" className="mb-1.5 block text-[13px] font-medium text-zinc-600">
                Цена
              </label>
              <div className="relative">
                <input
                  id="price"
                  inputMode="numeric"
                  value={draft.price ? formatPrice(Number(draft.price)) : ""}
                  onChange={(event) => patch({ price: digitsOnly(event.target.value).slice(0, 12) })}
                  placeholder="120 000 000"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-zinc-400">
                  сум
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="city" className="mb-1.5 block text-[13px] font-medium text-zinc-600">
                Город
              </label>
              <select
                id="city"
                value={draft.city}
                onChange={(event) => patch({ city: event.target.value })}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {showDetails ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="year" className="mb-1.5 block text-[13px] font-medium text-zinc-600">
                    Год
                  </label>
                  <input
                    id="year"
                    inputMode="numeric"
                    value={draft.year}
                    onChange={(event) => patch({ year: digitsOnly(event.target.value).slice(0, 4) })}
                    placeholder="2022"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
                  />
                </div>
                <div>
                  <label htmlFor="mileage" className="mb-1.5 block text-[13px] font-medium text-zinc-600">
                    Пробег, км
                  </label>
                  <input
                    id="mileage"
                    inputMode="numeric"
                    value={draft.mileage}
                    onChange={(event) =>
                      patch({ mileage: digitsOnly(event.target.value).slice(0, 7) })
                    }
                    placeholder="45000"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
                  />
                </div>
                <div className="col-span-2">
                  <span className="mb-1.5 block text-[13px] font-medium text-zinc-600">Состояние</span>
                  <div className="flex gap-2">
                    {(Object.keys(CONDITION_LABELS) as Condition[]).map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() =>
                          patch({ condition: draft.condition === condition ? "" : condition })
                        }
                        className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                          draft.condition === condition
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        {CONDITION_LABELS[condition]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="fuel" className="mb-1.5 block text-[13px] font-medium text-zinc-600">
                    Топливо
                  </label>
                  <select
                    id="fuel"
                    value={draft.fuel}
                    onChange={(event) => patch({ fuel: event.target.value as Fuel | "" })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
                  >
                    <option value="">Не указано</option>
                    {(Object.keys(FUEL_LABELS) as Fuel[]).map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {FUEL_LABELS[fuel]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="transmission"
                    className="mb-1.5 block text-[13px] font-medium text-zinc-600"
                  >
                    Коробка
                  </label>
                  <select
                    id="transmission"
                    value={draft.transmission}
                    onChange={(event) =>
                      patch({ transmission: event.target.value as Transmission | "" })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
                  >
                    <option value="">Не указано</option>
                    {(Object.keys(TRANSMISSION_LABELS) as Transmission[]).map((item) => (
                      <option key={item} value={item}>
                        {TRANSMISSION_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <span className="mb-1.5 block text-[13px] font-medium text-zinc-600">Кузов</span>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(BODY_LABELS) as BodyType[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => patch({ body: draft.body === item ? "" : item })}
                        className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                          draft.body === item
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        {BODY_LABELS[item]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                + Добавить год, пробег и состояние
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-[13px] font-medium text-zinc-600"
              >
                Описание
              </label>
              <textarea
                id="description"
                rows={7}
                value={draft.description}
                onChange={(event) => patch({ description: event.target.value })}
                placeholder="Состояние, комплектация, история обслуживания, причина продажи…"
                autoFocus
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] leading-relaxed outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
              />
              <p className="mt-1.5 text-right text-[12px] text-zinc-400">
                {draft.description.trim().length} символов
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-[13px] font-medium text-zinc-600">
                Телефон <span className="font-normal text-zinc-400">— необязательно</span>
              </label>
              <input
                id="phone"
                inputMode="tel"
                value={draft.phone}
                onChange={(event) => patch({ phone: event.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5"
              />
              <p className="mt-1.5 text-[12px] text-zinc-400">
                Покажем номер только по кнопке «Показать телефон».
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={step === 0 ? () => router.back() : back}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 0 ? "Отмена" : "Назад"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            Далее
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? "Сохранить изменения" : "Создать карточку"}
          </button>
        )}
      </div>
    </form>
  );
}
