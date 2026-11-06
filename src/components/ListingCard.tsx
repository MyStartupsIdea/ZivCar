import Link from "next/link";
import { CarArt } from "@/components/CarArt";
import { CompareToggle } from "@/components/CompareToggle";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CONDITION_LABELS, type Listing } from "@/lib/listings";
import { formatMileage, formatPrice, timeAgo } from "@/lib/format";

export function ListingCard({ listing }: { listing: Listing }) {
  const meta = [
    listing.year ? String(listing.year) : null,
    formatMileage(listing.mileage),
    listing.city,
  ].filter(Boolean);

  return (
    <div className="group relative">
      <Link href={`/ads/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100">
          {listing.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <CarArt
              seed={listing.id}
              label={listing.title}
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}

          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
            {!listing.published && (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-zinc-600 backdrop-blur">
                Снято
              </span>
            )}
            {listing.photos.length > 1 && (
              <span className="rounded-full bg-zinc-900/65 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                {listing.photos.length} фото
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h3 className="line-clamp-1 text-[15px] font-medium tracking-tight text-zinc-900">
            {listing.title}
          </h3>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-zinc-900">
            {formatPrice(listing.price)}
            <span className="ml-1 text-[13px] font-normal text-zinc-400">сум</span>
          </p>
          <p className="mt-1 truncate text-[13px] text-zinc-500">
            {meta.length > 0 ? meta.join(" · ") : CONDITION_LABELS[listing.condition]}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {CONDITION_LABELS[listing.condition]} · {timeAgo(listing.created_at)}
          </p>
        </div>
      </Link>

      <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
        <FavoriteButton id={listing.id} />
        <CompareToggle listingId={listing.id} />
      </div>
    </div>
  );
}
