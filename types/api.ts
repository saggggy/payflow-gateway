import type { CurrencyCode } from "./payment";

/** Successful mock gateway response. */
export interface PayApiSuccessBody {
  outcome: "success";
  transactionId: string;
  amount: string;
  currency: CurrencyCode;
}

/** Declined / error-style response from mock gateway. */
export interface PayApiFailureBody {
  outcome: "failure";
  transactionId: string;
  reason: string;
}

/** Union of all JSON bodies returned by `POST /api/pay` (after the route is implemented). */
export type PayApiResponseBody = PayApiSuccessBody | PayApiFailureBody;
