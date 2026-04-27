import type { CardType } from "@/types";

const AMEX_PREFIX = /^(34|37)/;
const VISA_PREFIX = /^4/;
const MC_RANGE_2 = /^2(22[1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720)/;
const MC_RANGE_51_55 = /^5[1-5]/;

export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Heuristic from PAN digits (no spaces). */
export function detectCardType(digits: string): CardType {
  if (digits.length === 0) return "unknown";
  if (AMEX_PREFIX.test(digits)) return "amex";
  if (VISA_PREFIX.test(digits)) return "visa";
  if (MC_RANGE_51_55.test(digits) || MC_RANGE_2.test(digits)) {
    return "mastercard";
  }
  return "unknown";
}

export function maxPanLength(cardType: CardType): number {
  return cardType === "amex" ? 15 : 16;
}

/**
 * Visa/Mastercard: groups of 4. Amex: 4-6-5 (common UX while still matching “spaced groups”).
 */
export function formatCardDisplay(digits: string): string {
  const d = stripNonDigits(digits);
  const kind = detectCardType(d);
  const max = maxPanLength(kind);
  const slice = d.slice(0, max);

  if (kind === "amex") {
    const a = slice.slice(0, 4);
    const b = slice.slice(4, 10);
    const c = slice.slice(10, 15);
    return [a, b, c].filter(Boolean).join(" ");
  }

  return slice.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatPreviewPan(displayChars: string, kind: CardType): string {
  const max = maxPanLength(kind);
  const pad = displayChars.slice(0, max).padEnd(max, "•");
  if (kind === "amex") {
    const a = pad.slice(0, 4);
    const b = pad.slice(4, 10);
    const c = pad.slice(10, 15);
    return [a, b, c].filter((x) => x.length > 0).join(" ");
  }
  return pad.replace(/(.{4})/g, "$1 ").trim();
}

/** PAN for preview: bullets except the last four entered digits (when PAN is longer). */
export function digitsToPreviewDisplay(digits: string): string {
  const d = stripNonDigits(digits);
  const kind = detectCardType(d);
  const max = maxPanLength(kind);
  const slots = Array.from({ length: max }, (_, i) => {
    const ch = d[i];
    if (!ch) return "•";
    if (d.length <= 4) return ch;
    if (i < d.length - 4) return "•";
    return ch;
  }).join("");
  return formatPreviewPan(slots, kind);
}
