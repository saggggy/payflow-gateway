"use client";

import { useEffect, useMemo, useRef } from "react";

import { TransactionHistory } from "@/components/transaction-history";
import { TransactionHistoryDetail } from "@/components/transaction-history-detail";
import { useTransactionHistorySync } from "@/hooks/use-transaction-history-sync";
import { usePaymentStore } from "@/hooks/use-payment-store";

export function TransactionHistorySection() {
  useTransactionHistorySync();

  const detailRef = useRef<HTMLDivElement>(null);

  const rows = usePaymentStore((s) => s.transactions);
  const selectedId = usePaymentStore((s) => s.selectedTransactionId);
  const setSelectedTransactionId = usePaymentStore(
    (s) => s.setSelectedTransactionId,
  );

  const selectedRecord = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  useEffect(() => {
    if (!selectedRecord) return;
    const frame = requestAnimationFrame(() => {
      detailRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedRecord]);

  return (
    <section
      className="border-t border-zinc-200/80 pt-14"
      aria-labelledby="history-section-title"
    >
      <div className="mb-8 max-w-2xl space-y-2">
        <h2
          id="history-section-title"
          className="text-2xl font-semibold tracking-tight text-zinc-900"
        >
          Recent payments
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600">
          Every outcome is saved quietly on this device. Same transaction id,
          same row — retries simply update the story instead of cluttering the
          list.
        </p>
      </div>

      <div className="grid max-w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <TransactionHistory
          rows={rows}
          selectedId={selectedId}
          onSelect={(id) => setSelectedTransactionId(id)}
        />
        <TransactionHistoryDetail
          ref={detailRef}
          record={selectedRecord}
          onClearSelection={() => setSelectedTransactionId(null)}
        />
      </div>
    </section>
  );
}
