import { create } from "zustand";

import type { PaymentStatus, TransactionRecord } from "@/types";

export interface PaymentStoreState {
  lifecycleStatus: PaymentStatus;
  statusSubtitle: string | null;
  transactions: TransactionRecord[];
  setLifecycleStatus: (status: PaymentStatus, subtitle?: string | null) => void;
  setTransactions: (transactions: TransactionRecord[]) => void;
  resetPaymentSession: () => void;
}

export const usePaymentStore = create<PaymentStoreState>((set) => ({
  lifecycleStatus: "idle",
  statusSubtitle: null,
  transactions: [],
  setLifecycleStatus: (lifecycleStatus, statusSubtitle) =>
    set({
      lifecycleStatus,
      statusSubtitle: statusSubtitle ?? null,
    }),
  setTransactions: (transactions) => set({ transactions }),
  resetPaymentSession: () =>
    set({ lifecycleStatus: "idle", statusSubtitle: null }),
}));
