import type { CurrencyCode, TransactionRecord, TransactionRecordStatus } from "@/types";

/** Bump this if you ever change the row shape so old cache is ignored gracefully. */
export const TRANSACTION_HISTORY_STORAGE_KEY =
  "payflow-gateway.transaction-history.v1";

/** Assignment: at most three pay attempts per transaction id. */
export const MAX_PAY_ATTEMPTS_PER_TRANSACTION = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTransactionStatus(
  value: unknown,
): value is TransactionRecordStatus {
  return (
    value === "pending" ||
    value === "success" ||
    value === "failed" ||
    value === "timeout"
  );
}

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "INR" || value === "USD";
}

function parseOneRow(raw: unknown): TransactionRecord | null {
  if (!isRecord(raw)) return null;
  const id = raw.id;
  const amount = raw.amount;
  const currency = raw.currency;
  const status = raw.status;
  const timestamp = raw.timestamp;
  const attemptCount = raw.attemptCount;
  if (typeof id !== "string" || id.length === 0) return null;
  if (typeof amount !== "string") return null;
  if (!isCurrencyCode(currency)) return null;
  if (!isTransactionStatus(status)) return null;
  if (typeof timestamp !== "string") return null;
  if (typeof attemptCount !== "number" || !Number.isFinite(attemptCount)) {
    return null;
  }
  const failureReason = raw.failureReason;
  return {
    id,
    amount,
    currency,
    status,
    timestamp,
    attemptCount: Math.max(1, Math.floor(attemptCount)),
    failureReason:
      typeof failureReason === "string" && failureReason.length > 0
        ? failureReason
        : undefined,
  };
}

export function readStoredTransactions(): TransactionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TRANSACTION_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseOneRow)
      .filter((row): row is TransactionRecord => row !== null);
  } catch {
    return [];
  }
}

export function writeStoredTransactions(rows: TransactionRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      TRANSACTION_HISTORY_STORAGE_KEY,
      JSON.stringify(rows),
    );
  } catch {
    // Private mode or quota — fail quietly; in-memory history still works this session.
  }
}

/**
 * One row per payment id: newest attempt overwrites the same slot so retries never
 * duplicate lines in the list.
 */
export function upsertTransactionById(
  previous: TransactionRecord[],
  incoming: TransactionRecord,
): TransactionRecord[] {
  const others = previous.filter((row) => row.id !== incoming.id);
  return [incoming, ...others];
}
