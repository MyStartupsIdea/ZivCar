import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "avto.uz — объявления о продаже авто в Узбекистане",
    template: "%s — avto.uz",
  },
  description:
    "Бесплатные объявления о продаже автомобилей в Узбекистане. Публикация занимает минуту: фото, название, описание — и карточка готова.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex min-h-dvh flex-col bg-white text-zinc-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
