"use client";

import { useEffect, useRef } from "react";

import { usePaymentStore } from "@/hooks/use-payment-store";
import {
  readStoredTransactions,
  writeStoredTransactions,
} from "@/utils/transaction-history-storage";

/**
 * Hydrates the list once from disk, then quietly mirrors every change back to
 * localStorage so a refresh does not erase the shopper’s trail.
 */
export function useTransactionHistorySync() {
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    const fromDisk = readStoredTransactions();
    if (fromDisk.length > 0) {
      usePaymentStore.setState({ transactions: fromDisk });
    }
  }, []);

  useEffect(() => {
    let serialized = JSON.stringify(usePaymentStore.getState().transactions);
    return usePaymentStore.subscribe((state) => {
      const next = JSON.stringify(state.transactions);
      if (next === serialized) return;
      serialized = next;
      writeStoredTransactions(state.transactions);
    });
  }, []);
}
