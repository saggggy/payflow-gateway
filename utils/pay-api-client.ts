import type { PaymentPayload } from "@/types";
import type {
  PayApiFailureBody,
  PayApiResponseBody,
  PayApiSuccessBody,
} from "@/types";

export type PayClientResult =
  | { kind: "success"; body: PayApiSuccessBody }
  | { kind: "failure"; body: PayApiFailureBody }
  | { kind: "timeout" }
  | { kind: "network"; message: string }
  | { kind: "invalid_json"; message: string }
  | { kind: "bad_status"; status: number; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePayResponseBody(json: unknown): PayApiResponseBody | null {
  if (!isRecord(json)) return null;
  const outcome = json.outcome;
  const transactionId = json.transactionId;
  if (outcome === "success") {
    const amount = json.amount;
    const currency = json.currency;
    if (
      typeof transactionId === "string" &&
      typeof amount === "string" &&
      (currency === "INR" || currency === "USD")
    ) {
      return {
        outcome: "success",
        transactionId,
        amount,
        currency,
      };
    }
    return null;
  }
  if (outcome === "failure") {
    const reason = json.reason;
    if (typeof transactionId === "string" && typeof reason === "string") {
      return { outcome: "failure", transactionId, reason };
    }
    return null;
  }
  return null;
}

export async function postPayment(
  payload: PaymentPayload,
  signal: AbortSignal,
): Promise<PayClientResult> {
  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return {
        kind: "bad_status",
        status: res.status,
        message: "The server returned an unreadable response.",
      };
    }

    if (!res.ok) {
      const msg =
        isRecord(json) && typeof json.error === "string"
          ? json.error
          : "Something went wrong. Try again.";
      return { kind: "bad_status", status: res.status, message: msg };
    }

    const body = parsePayResponseBody(json);
    if (!body) {
      return {
        kind: "invalid_json",
        message: "Unexpected response from the payment service.",
      };
    }

    if (body.outcome === "success") {
      return { kind: "success", body };
    }
    return { kind: "failure", body };
  } catch (e) {
    const isAbort =
      (e instanceof DOMException && e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError");
    if (isAbort) {
      return { kind: "timeout" };
    }
    if (e instanceof TypeError) {
      return {
        kind: "network",
        message: "Check your connection and try again.",
      };
    }
    return {
      kind: "network",
      message: "We could not reach the payment service.",
    };
  }
}
