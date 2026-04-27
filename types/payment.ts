/** UI + store lifecycle for a single payment attempt / flow. */
export type PaymentStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "timeout";

/** Detected scheme from BIN / card number rules. */
export type CardType = "visa" | "mastercard" | "amex" | "unknown";

/** Assignment requires at least INR and USD. */
export type CurrencyCode = "INR" | "USD";

/** Persisted row in transaction history (localStorage). */
export type TransactionRecordStatus =
  | "pending"
  | "success"
  | "failed"
  | "timeout";

export interface TransactionRecord {
  id: string;
  amount: string;
  currency: CurrencyCode;
  status: TransactionRecordStatus;
  /** ISO 8601 timestamp */
  timestamp: string;
  failureReason?: string;
  attemptCount: number;
}

/** Body sent to `POST /api/pay` (mock gateway). */
export interface PaymentPayload {
  transactionId: string;
  amount: string;
  currency: CurrencyCode;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}
