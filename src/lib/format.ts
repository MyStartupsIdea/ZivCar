export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value));
}

export function formatMileage(value: number | null | undefined): string | null {
  if (value == null) return null;
  return `${new Intl.NumberFormat("ru-RU").format(value)} км`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "вчера";
  if (days < 30) return `${days} дн назад`;
  return formatDate(iso);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    const d = digits.slice(3);
    return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
  }
  return phone;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}
