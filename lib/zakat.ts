export const OUNCE_TO_GRAM = 31.1034768;
export const ZAKAT_RATE = 0.025;
export const GOLD_NISAB_GRAMS = 85;
export const SILVER_NISAB_GRAMS = 595;

export function calcNisab(idrPerGram: number, grams: number) {
  return (idrPerGram || 0) * grams;
}

export function calcZakat(zakatable: number, nisab: number, rate = ZAKAT_RATE) {
  const base = Number.isFinite(zakatable) ? zakatable : 0;
  const threshold = Number.isFinite(nisab) ? nisab : 0;
  const obligatory = base >= threshold;
  const amount = obligatory ? base * rate : 0;
  return { obligatory, amount };
}

export const toIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(Number.isFinite(n) ? n : 0);
