"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ListingForm } from "@/components/ListingForm";
import { useListing } from "@/lib/listings";

function EditContent() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const { listing, ready } = useListing(id);

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[15px] font-medium">Объявление не найдено</p>
        <Link
          href="/my"
          className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Мои объявления
        </Link>
      </div>
    );
  }

  return <ListingForm initial={listing} />;
}

export default function EditListingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-5 py-16">
          <div className="h-8 w-40 animate-pulse rounded bg-zinc-100" />
          <div className="mt-6 h-48 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      }
    >
      <EditContent />
    </Suspense>
  );
}
