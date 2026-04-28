import { create } from "zustand";

import type { CurrencyCode, PaymentStatus, TransactionRecord } from "@/types";

import {
  MAX_PAY_ATTEMPTS_PER_TRANSACTION,
  upsertTransactionById,
} from "@/utils/transaction-history-storage";

export type TerminalPaymentOutcome = "success" | "failed" | "timeout";

export interface PaymentStoreState {
  lifecycleStatus: PaymentStatus;
  statusSubtitle: string | null;
  lastPayErrorSource: "none" | "network" | "gateway" | "timeout";
  activeTransactionId: string | null;
  /** How many pay requests we have already fired for this transaction id (max 3). */
  payAttemptsUsed: number;
  transactions: TransactionRecord[];
  selectedTransactionId: string | null;
  setLifecycleStatus: (
    status: PaymentStatus,
    subtitle?: string | null,
    errorSource?: PaymentStoreState["lastPayErrorSource"],
  ) => void;
  ensureActiveTransactionId: () => string;
  /** Returns false only if something is mis-wired — UI should hide the Pay button first. */
  beginPayAttempt: () => boolean;
  /** After a failed or timed-out payment, hop back to the form without minting a new id. */
  prepareRetry: () => void;
  recordTerminalPayment: (payload: {
    transactionId: string;
    amount: string;
    currency: CurrencyCode;
    outcome: TerminalPaymentOutcome;
    attemptOrdinal: number;
    failureSummary: string | null;
  }) => void;
  setTransactions: (transactions: TransactionRecord[]) => void;
  setSelectedTransactionId: (id: string | null) => void;
  resetPaymentSession: () => void;
}

export const usePaymentStore = create<PaymentStoreState>((set, get) => ({
  lifecycleStatus: "idle",
  statusSubtitle: null,
  lastPayErrorSource: "none",
  activeTransactionId: null,
  payAttemptsUsed: 0,
  transactions: [],
  selectedTransactionId: null,
  setLifecycleStatus: (lifecycleStatus, statusSubtitle, lastPayErrorSource) =>
    set({
      lifecycleStatus,
      statusSubtitle: statusSubtitle ?? null,
      lastPayErrorSource:
        lifecycleStatus === "idle" || lifecycleStatus === "processing"
          ? "none"
          : lifecycleStatus === "success"
            ? "none"
            : lifecycleStatus === "timeout"
              ? (lastPayErrorSource ?? "timeout")
              : (lastPayErrorSource ?? "gateway"),
    }),
  ensureActiveTransactionId: () => {
    const existing = get().activeTransactionId;
    if (existing) return existing;
    const id = crypto.randomUUID();
    set({ activeTransactionId: id });
    return id;
  },
  beginPayAttempt: () => {
    const used = get().payAttemptsUsed;
    if (used >= MAX_PAY_ATTEMPTS_PER_TRANSACTION) return false;
    set({ payAttemptsUsed: used + 1 });
    return true;
  },
  prepareRetry: () =>
    set({
      lifecycleStatus: "idle",
      statusSubtitle: null,
      lastPayErrorSource: "none",
    }),
  recordTerminalPayment: (payload) => {
    const status =
      payload.outcome === "success"
        ? "success"
        : payload.outcome === "timeout"
          ? "timeout"
          : "failed";
    const row: TransactionRecord = {
      id: payload.transactionId,
      amount: payload.amount,
      currency: payload.currency,
      status,
      timestamp: new Date().toISOString(),
      attemptCount: payload.attemptOrdinal,
      failureReason:
        status !== "success" && payload.failureSummary
          ? payload.failureSummary
          : undefined,
    };
    set((state) => ({
      transactions: upsertTransactionById(state.transactions, row),
    }));
  },
  setTransactions: (transactions) => set({ transactions }),
  setSelectedTransactionId: (selectedTransactionId) =>
    set({ selectedTransactionId }),
  resetPaymentSession: () =>
    set({
      lifecycleStatus: "idle",
      statusSubtitle: null,
      lastPayErrorSource: "none",
      activeTransactionId: null,
      payAttemptsUsed: 0,
      selectedTransactionId: null,
    }),
}));
