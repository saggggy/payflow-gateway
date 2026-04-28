"use client";

import type { TransactionRecord } from "@/types";

import { formatAmountForDisplay } from "@/utils/amount";
import { formatHistoryTimestamp } from "@/utils/format-history-timestamp";

type TransactionHistoryProps = {
  rows: TransactionRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function statusPill(status: TransactionRecord["status"]) {
  const styles: Record<TransactionRecord["status"], string> = {
    success: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    failed: "bg-rose-50 text-rose-900 ring-rose-200",
    timeout: "bg-amber-50 text-amber-950 ring-amber-200",
    pending: "bg-zinc-100 text-zinc-800 ring-zinc-200",
  };
  return styles[status];
}

function shortStatus(status: TransactionRecord["status"]): string {
  switch (status) {
    case "success":
      return "Paid";
    case "failed":
      return "Failed";
    case "timeout":
      return "Timeout";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

export function TransactionHistory({
  rows,
  selectedId,
  onSelect,
}: TransactionHistoryProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/80 p-8 text-center text-sm text-zinc-500">
        <p className="font-medium text-zinc-700">No payments yet</p>
        <p className="mt-2 leading-relaxed">
          When you finish a checkout above, a tidy row will appear here — even
          across page refreshes.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      {rows.map((row) => {
        const isSelected = row.id === selectedId;
        const amountLabel = formatAmountForDisplay(row.amount, row.currency);
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row.id)}
              className={`flex min-h-11 w-full flex-col gap-2 px-4 py-4 text-left transition sm:flex-row sm:items-center sm:justify-between ${
                isSelected
                  ? "bg-teal-50/80 ring-1 ring-inset ring-teal-200"
                  : "hover:bg-zinc-50"
              }`}
              aria-pressed={isSelected}
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-mono text-[11px] text-zinc-500">
                  {row.id}
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {amountLabel}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatHistoryTimestamp(row.timestamp)}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusPill(row.status)}`}
              >
                {shortStatus(row.status)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
