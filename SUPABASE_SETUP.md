# Supabase для Car Marketplace

После создания проекта выполни одноразово:

## 1. SQL-миграция (таблицы + RLS + политики)

Открой [SQL Editor](https://supabase.com/dashboard) → `New Query` → вставь `supabase/migrations/20260101000000_init.sql` → `Run`.

Миграция создаёт:
- таблицы `profiles`, `ads`, `ad_photos`
- триггер обновления `ads.updated_at`
- политики RLS: публичные объявления читают все, управлять своими — только авторизованные продавцы
- функцию `generate_listing_id()` для детерминированных ID вида `AD-20260401-a1b2c3d4`

## 2. Бакет фото

Storage → New Bucket → имя `cars-photos` → Public bucket ON → Create.

В продакшене лучше хранить приватно и слать краткие URL через сервер, но для MVP проще — публичный бакет, фото доступны по прямому URL.

## 3. Аутентификация

Authentication → Providers → Phone → включи, сохрани. Email+пароль включён по умолчанию — для MVP используем его как основной канал (надёжнее, без SMS-кодов).

## 4. Переменные окружения

Скопируй `.env.example` → `.env.local` и подставь значения из Project Settings → API.

```bash
cp .env.example .env.local
# затем отредактируй .env.local
```
