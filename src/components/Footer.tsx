import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">
            avto<span className="text-zinc-400">.uz</span>
          </p>
          <p className="mt-2 max-w-[15rem] text-[13px] leading-relaxed text-zinc-500">
            Бесплатные объявления об автомобилях по всему Узбекистану. Без комиссий и рекламы.
          </p>
        </div>

        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-400">
            Каталог
          </p>
          <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
            <li>
              <Link href="/search" className="transition-colors hover:text-zinc-900">
                Все автомобили
              </Link>
            </li>
            <li>
              <Link href="/search?body=suv" className="transition-colors hover:text-zinc-900">
                Кроссоверы
              </Link>
            </li>
            <li>
              <Link href="/search?fuel=electric" className="transition-colors hover:text-zinc-900">
                Электромобили
              </Link>
            </li>
            <li>
              <Link href="/search?sort=price_asc" className="transition-colors hover:text-zinc-900">
                Дешёвые сначала
              </Link>
            </li>
            <li>
              <Link href="/dealers" className="transition-colors hover:text-zinc-900">
                Продавцы
              </Link>
            </li>
            <li>
              <Link href="/guides" className="transition-colors hover:text-zinc-900">
                Чек-лист осмотра
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-400">
            Продавцам
          </p>
          <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
            <li>
              <Link href="/new" className="transition-colors hover:text-zinc-900">
                Разместить объявление
              </Link>
            </li>
            <li>
              <Link href="/my" className="transition-colors hover:text-zinc-900">
                Мои объявления
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="transition-colors hover:text-zinc-900">
                Избранное
              </Link>
            </li>
            <li>
              <Link href="/saved" className="transition-colors hover:text-zinc-900">
                Сохранённые поиски
              </Link>
            </li>
            <li>
              <Link href="/history" className="transition-colors hover:text-zinc-900">
                Вы смотрели
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-400">
            Безопасность
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">
            Не переводите предоплату до личной встречи. Проверяйте документы и VIN перед покупкой.
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-[12px] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© avto.uz — прототип маркетплейса</p>
          <p>Узбекистан · сум (UZS)</p>
        </div>
      </div>
    </footer>
  );
}
