import { create } from "zustand";

import type { PaymentStatus, TransactionRecord } from "@/types";

export interface PaymentStoreState {
  lifecycleStatus: PaymentStatus;
  transactions: TransactionRecord[];
  setLifecycleStatus: (status: PaymentStatus) => void;
  setTransactions: (transactions: TransactionRecord[]) => void;
}

export const usePaymentStore = create<PaymentStoreState>((set) => ({
  lifecycleStatus: "idle",
  transactions: [],
  setLifecycleStatus: (lifecycleStatus) => set({ lifecycleStatus }),
  setTransactions: (transactions) => set({ transactions }),
}));
