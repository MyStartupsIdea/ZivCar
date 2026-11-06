import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-28 text-center">
      <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-zinc-400">404</p>
      <h1 className="mt-3 text-[26px] font-semibold tracking-tight">Страница не найдена</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Возможно, объявление сняли с публикации или удалили.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        На главную
      </Link>
    </div>
  );
}
