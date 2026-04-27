/**
 * Client-only: runs the mock pay request with a hard timeout and minimum UI time.
 * Import only from client components or hooks.
 */

import type { PaymentPayload } from "@/types";

import { postPayment, type PayClientResult } from "./pay-api-client";

/** Frontend cancels the request after this many ms (assignment). */
export const PAY_CLIENT_TIMEOUT_MS = 6000;

/** Minimum time the processing state stays visible before showing an outcome. */
export const PAY_MIN_PROCESSING_UI_MS = 2000;

export async function executePaymentRequest(
  payload: PaymentPayload,
): Promise<PayClientResult> {
  const controller = new AbortController();
  const abortTimer = window.setTimeout(() => {
    controller.abort();
  }, PAY_CLIENT_TIMEOUT_MS);
  try {
    const payPromise = postPayment(payload, controller.signal);
    const minUiPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, PAY_MIN_PROCESSING_UI_MS);
    });
    const [payResult] = await Promise.all([payPromise, minUiPromise]);
    return payResult;
  } finally {
    window.clearTimeout(abortTimer);
  }
}
