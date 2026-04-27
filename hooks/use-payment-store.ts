import { create } from "zustand";

import type { PaymentStatus, TransactionRecord } from "@/types";

export interface PaymentStoreState {
  lifecycleStatus: PaymentStatus;
  statusSubtitle: string | null;
  /** Transport vs issuer-style failure while lifecycle is `failed`. */
  lastPayErrorSource: "none" | "network" | "gateway" | "timeout";
  /** Stable id for the current checkout session (retries reuse it in later phases). */
  activeTransactionId: string | null;
  transactions: TransactionRecord[];
  setLifecycleStatus: (
    status: PaymentStatus,
    subtitle?: string | null,
    errorSource?: PaymentStoreState["lastPayErrorSource"],
  ) => void;
  ensureActiveTransactionId: () => string;
  setTransactions: (transactions: TransactionRecord[]) => void;
  resetPaymentSession: () => void;
}

export const usePaymentStore = create<PaymentStoreState>((set, get) => ({
  lifecycleStatus: "idle",
  statusSubtitle: null,
  lastPayErrorSource: "none",
  activeTransactionId: null,
  transactions: [],
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
  setTransactions: (transactions) => set({ transactions }),
  resetPaymentSession: () =>
    set({
      lifecycleStatus: "idle",
      statusSubtitle: null,
      lastPayErrorSource: "none",
      activeTransactionId: null,
    }),
}));
