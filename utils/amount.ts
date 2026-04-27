import type { CurrencyCode } from "@/types";

const AMOUNT_REGEX = /^\d+(\.\d{0,2})?$/;

export function normalizeAmountInput(raw: string): string {
  return raw.trim();
}

export function isValidAmountString(value: string): boolean {
  if (!value || value === ".") return false;
  if (!AMOUNT_REGEX.test(value)) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function formatAmountForDisplay(
  value: string,
  currency: CurrencyCode,
): string {
  if (!isValidAmountString(value)) return "—";
  const n = Number(value);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${value}`;
  }
}
