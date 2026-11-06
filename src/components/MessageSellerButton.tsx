"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useCurrentAccount } from "@/lib/accounts";
import { openThread } from "@/lib/messages";

export function MessageSellerButton({
  listingId,
  sellerId,
  className = "",
  label = "Написать продавцу",
}: {
  listingId: string;
  sellerId: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const { account, ready } = useCurrentAccount();
  const own = ready && account?.id === sellerId;

  return (
    <button
      type="button"
      disabled={!ready || own}
      onClick={() => {
        if (!account) {
          router.push("/account");
          return;
        }
        const threadId = openThread(listingId, account.id, sellerId);
        router.push(`/messages/${threadId}`);
      }}
      className={`flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 py-2.5 text-sm font-medium transition-colors hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      {own ? "Ваше объявление" : label}
    </button>
  );
}
