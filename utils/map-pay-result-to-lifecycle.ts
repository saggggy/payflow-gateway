import type { PaymentStatus } from "@/types";

import { formatAmountForDisplay } from "./amount";
import type { PayClientResult } from "./pay-api-client";

export type MappedPayOutcome = {
  lifecycleStatus: Extract<
    PaymentStatus,
    "success" | "failed" | "timeout"
  >;
  statusSubtitle: string | null;
  /** Distinguishes transport issues from issuer/API declines (same `failed` UI state). */
  errorSource: "none" | "network" | "gateway" | "timeout";
};

export function mapPayClientResultToLifecycle(
  result: PayClientResult,
): MappedPayOutcome {
  switch (result.kind) {
    case "success":
      return {
        lifecycleStatus: "success",
        statusSubtitle: `Paid ${formatAmountForDisplay(result.body.amount, result.body.currency)}.`,
        errorSource: "none",
      };
    case "failure":
      return {
        lifecycleStatus: "failed",
        statusSubtitle: result.body.reason,
        errorSource: "gateway",
      };
    case "timeout":
      return {
        lifecycleStatus: "timeout",
        statusSubtitle:
          "The gateway did not respond in time. You were not charged.",
        errorSource: "timeout",
      };
    case "network":
      return {
        lifecycleStatus: "failed",
        statusSubtitle: result.message,
        errorSource: "network",
      };
    case "invalid_json":
      return {
        lifecycleStatus: "failed",
        statusSubtitle: result.message,
        errorSource: "gateway",
      };
    case "bad_status":
      return {
        lifecycleStatus: "failed",
        statusSubtitle: result.message,
        errorSource: "gateway",
      };
  }
}
