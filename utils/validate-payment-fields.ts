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
  if (v.length === 0) return "Enter the name on the card.";
  if (v.length < 2) return "Name looks too short.";
  if (!/^[a-zA-Z\s.'-]+$/.test(v)) {
    return "Use letters and spaces only.";
  }
  return undefined;
}

export function validateCardNumber(digits: string): string | undefined {
  if (digits.length === 0) return "Enter a card number.";
  const kind = detectCardType(digits);
  const max = maxPanLength(kind);
  if (kind === "unknown" && digits.length >= 6) {
    return "Unsupported card type. Use Visa, Mastercard, or Amex.";
  }
  if (digits.length < max) {
    return `Enter all ${max} digits.`;
  }
  if (digits.length > max) return "Card number is too long.";
  return undefined;
}

export function validateExpiry(raw: string): string | undefined {
  const compact = raw.replace(/\D/g, "");
  if (compact.length === 0) return "Enter expiry (MM/YY).";
  if (compact.length < 4) return "Use MM/YY.";
  const parsed = parseExpiryInput(raw);
  if (!parsed) return "Month must be between 01 and 12.";
  if (isExpiryInPast(parsed)) return "Expiry date is in the past.";
  return undefined;
}

export function validateCvv(cvv: string, cardType: CardType): string | undefined {
  const len = cardType === "amex" ? 4 : 3;
  if (!/^\d+$/.test(cvv)) return "CVV must be digits only.";
  if (cvv.length < len) return `Enter the ${len}-digit CVV.`;
  if (cvv.length > len) return `CVV must be ${len} digits for this card.`;
  return undefined;
}

export function validateAmount(raw: string): string | undefined {
  const v = normalizeAmountInput(raw);
  if (v.length === 0) return "Enter an amount.";
  if (!isValidAmountString(v)) {
    return "Enter a valid amount (up to 2 decimal places).";
  }
  return undefined;
}

export function validateCurrency(value: CurrencyCode): string | undefined {
  if (value !== "INR" && value !== "USD") {
    return "Choose INR or USD.";
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
