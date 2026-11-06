const PALETTES: Array<[string, string]> = [
  ["#e7e5e4", "#d6d3d1"],
  ["#e4e4e7", "#d4d4d8"],
  ["#e2e8f0", "#cbd5e1"],
  ["#ece9e4", "#dcd6ce"],
  ["#e5e7eb", "#d1d5db"],
  ["#e8e6f0", "#d8d4e8"],
];

export function CarArt({
  seed,
  className = "",
  label = "Изображение автомобиля",
}: {
  seed: string;
  className?: string;
  label?: string;
}) {
  let hash = 7;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  const [from, to] = PALETTES[hash % PALETTES.length];
  const gradientId = `car-art-${hash}`;

  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gradientId})`} />
      <g transform="translate(70 100) scale(1.02)" fill="rgba(255,255,255,0.72)">
        <path d="M14 66c-6 0-10-4-10-10v-4c0-12 9-21 21-21h16l25-22c5-4 11-6 17-6h60c6 0 12 2 17 6l25 22h33c12 0 22 10 22 22v3c0 6-4 10-10 10H14z" />
        <circle cx="70" cy="70" r="14" />
        <circle cx="196" cy="70" r="14" />
      </g>
      <g fill="rgba(255,255,255,0.92)">
        <circle cx="146" cy="176" r="6" />
        <circle cx="268" cy="176" r="6" />
      </g>
    </svg>
  );
}
