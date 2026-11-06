export type CreditInput = {
  price: number;
  downPercent: number;
  months: number;
  annualRate: number;
};

export type CreditPlan = {
  down: number;
  principal: number;
  monthly: number;
  total: number;
  interest: number;
};

export function creditPlan({ price, downPercent, months, annualRate }: CreditInput): CreditPlan {
  const safePrice = Math.max(0, price);
  const down = Math.round((safePrice * Math.min(100, Math.max(0, downPercent))) / 100);
  const principal = Math.max(0, safePrice - down);
  const term = Math.max(1, Math.round(months));
  const monthlyRate = Math.max(0, annualRate) / 100 / 12;

  const monthly =
    monthlyRate === 0
      ? principal / term
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));

  const total = Math.round(monthly * term + down);

  return {
    down,
    principal,
    monthly: Math.round(monthly),
    total,
    interest: Math.max(0, total - safePrice),
  };
}

export const CREDIT_PRESETS = [
  { label: "12 мес · 0%", months: 12, annualRate: 0, downPercent: 30 },
  { label: "24 мес · 18%", months: 24, annualRate: 18, downPercent: 20 },
  { label: "36 мес · 22%", months: 36, annualRate: 22, downPercent: 15 },
  { label: "60 мес · 25%", months: 60, annualRate: 25, downPercent: 10 },
];
