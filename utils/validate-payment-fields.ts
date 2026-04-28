import type { CardType, CurrencyCode } from "@/types";

import { detectCardType, maxPanLength, stripNonDigits } from "./card";
import { isExpiryInPast, parseExpiryInput } from "./expiry";
import { isValidAmountString, normalizeAmountInput } from "./amount";

export type PaymentFieldName =
  | "cardholderName"
  | "cardNumber"
  | "expiry"
  | "cvv"
  | "amount"
  | "currency";

export interface PaymentFieldValues {
  cardholderName: string;
  cardNumberDigits: string;
  expiryRaw: string;
  cvv: string;
  amount: string;
  currency: CurrencyCode;
}

export function validateCardholderName(value: string): string | undefined {
  const v = value.trim();
  if (v.length === 0) {
    return "Add the name exactly as it is printed on the card.";
  }
  if (v.length < 2) {
    return "That name looks a little short — double-check the spelling.";
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(v)) {
    return "Stick to letters, spaces, and common punctuation (like O'Brien).";
  }
  return undefined;
}

export function validateCardNumber(digits: string): string | undefined {
  if (digits.length === 0) {
    return "Start typing your card number — we’ll format it for you.";
  }
  const kind = detectCardType(digits);
  const max = maxPanLength(kind);
  if (kind === "unknown" && digits.length >= 6) {
    return "This demo likes Visa, Mastercard, or American Express.";
  }
  if (digits.length < max) {
    return `Almost there — we still need ${max - digits.length} more digit${max - digits.length === 1 ? "" : "s"}.`;
  }
  if (digits.length > max) {
    return "That’s one digit too many for this card type.";
  }
  return undefined;
}

export function validateExpiry(raw: string): string | undefined {
  const compact = raw.replace(/\D/g, "");
  if (compact.length === 0) {
    return "Pop in the expiry as MM/YY — we’ll add the slash for you.";
  }
  if (compact.length < 4) {
    return "Month and year together should look like 08/27.";
  }
  const parsed = parseExpiryInput(raw);
  if (!parsed) {
    return "The month needs to be between 01 and 12.";
  }
  if (isExpiryInPast(parsed)) {
    return "That card looks expired — try a later date.";
  }
  return undefined;
}

export function validateCvv(cvv: string, cardType: CardType): string | undefined {
  const len = cardType === "amex" ? 4 : 3;
  if (!/^\d+$/.test(cvv)) {
    return "CVV is digits only — it’s the small code on the back (or on the front for Amex).";
  }
  if (cvv.length < len) {
    if (cardType === "amex") {
      return `Amex uses a 4-digit code from the front — you’ve typed ${cvv.length} so far.`;
    }
    return `We need ${len} digits from the back of the card — you’ve typed ${cvv.length} so far.`;
  }
  if (cvv.length > len) {
    return `Trim it to ${len} digits for this card type.`;
  }
  return undefined;
}

export function validateAmount(raw: string): string | undefined {
  const v = normalizeAmountInput(raw);
  if (v.length === 0) {
    return "Tell us how much you’d like to charge.";
  }
  if (!isValidAmountString(v)) {
    return "Use a positive number with up to two decimal places, like 49.99.";
  }
  return undefined;
}

export function validateCurrency(value: CurrencyCode): string | undefined {
  if (value !== "INR" && value !== "USD") {
    return "Pick either Indian rupees or US dollars for this demo.";
  }
  return undefined;
}

export function validateAllFields(values: PaymentFieldValues): Partial<
  Record<PaymentFieldName, string>
> {
  const cardType = detectCardType(values.cardNumberDigits);
  const errors: Partial<Record<PaymentFieldName, string>> = {};

  const eName = validateCardholderName(values.cardholderName);
  if (eName) errors.cardholderName = eName;

  const ePan = validateCardNumber(values.cardNumberDigits);
  if (ePan) errors.cardNumber = ePan;

  const eExp = validateExpiry(values.expiryRaw);
  if (eExp) errors.expiry = eExp;

  const eCvv = validateCvv(values.cvv, cardType === "unknown" ? "visa" : cardType);
  if (eCvv) errors.cvv = eCvv;

  const eAmt = validateAmount(values.amount);
  if (eAmt) errors.amount = eAmt;

  const eCur = validateCurrency(values.currency);
  if (eCur) errors.currency = eCur;

  return errors;
}

export function splitExpiryForPayload(expiryRaw: string): {
  expiryMonth: string;
  expiryYear: string;
} | null {
  const parsed = parseExpiryInput(expiryRaw);
  if (!parsed) return null;
  return {
    expiryMonth: String(parsed.month).padStart(2, "0"),
    expiryYear: String(parsed.yearTwoDigit).padStart(2, "0"),
  };
}

export function buildDigitsFromFormattedPan(formatted: string): string {
  return stripNonDigits(formatted);
}
