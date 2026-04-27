import type { CurrencyCode, PaymentPayload } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "INR" || value === "USD";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export type ParsePayloadResult =
  | { ok: true; payload: PaymentPayload }
  | { ok: false; error: string };

export function parsePaymentPayloadFromUnknown(data: unknown): ParsePayloadResult {
  if (!isRecord(data)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const transactionId = data.transactionId;
  const amount = data.amount;
  const currency = data.currency;
  const cardholderName = data.cardholderName;
  const cardNumber = data.cardNumber;
  const expiryMonth = data.expiryMonth;
  const expiryYear = data.expiryYear;
  const cvv = data.cvv;

  if (!isNonEmptyString(transactionId)) {
    return { ok: false, error: "transactionId is required." };
  }
  if (!isNonEmptyString(amount)) {
    return { ok: false, error: "amount is required." };
  }
  if (!isCurrencyCode(currency)) {
    return { ok: false, error: "currency must be INR or USD." };
  }
  if (!isNonEmptyString(cardholderName)) {
    return { ok: false, error: "cardholderName is required." };
  }
  if (!isNonEmptyString(cardNumber)) {
    return { ok: false, error: "cardNumber is required." };
  }
  if (!isNonEmptyString(expiryMonth)) {
    return { ok: false, error: "expiryMonth is required." };
  }
  if (!isNonEmptyString(expiryYear)) {
    return { ok: false, error: "expiryYear is required." };
  }
  if (!isNonEmptyString(cvv)) {
    return { ok: false, error: "cvv is required." };
  }

  return {
    ok: true,
    payload: {
      transactionId: transactionId.trim(),
      amount: amount.trim(),
      currency,
      cardholderName: cardholderName.trim(),
      cardNumber: cardNumber.trim(),
      expiryMonth: expiryMonth.trim(),
      expiryYear: expiryYear.trim(),
      cvv: cvv.trim(),
    },
  };
}
