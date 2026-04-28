"use client";

import { forwardRef } from "react";

import type { TransactionRecord } from "@/types";

import { checkoutLabelClass } from "@/components/payment-ui-styles";
import { formatAmountForDisplay } from "@/utils/amount";
import { formatHistoryTimestamp } from "@/utils/format-history-timestamp";

type TransactionHistoryDetailProps = {
  record: TransactionRecord | null;
  onClearSelection: () => void;
};

function friendlyStatus(status: TransactionRecord["status"]): string {
  switch (status) {
    case "success":
      return "Paid in full";
    case "failed":
      return "Declined or stopped";
    case "timeout":
      return "Timed out waiting on the gateway";
    case "pending":
      return "Still in flight";
    default:
      return status;
  }
}

export const TransactionHistoryDetail = forwardRef<
  HTMLDivElement,
  TransactionHistoryDetailProps
>(function TransactionHistoryDetail({ record, onClearSelection }, ref) {
  if (!record) {
    return (
      <div
        ref={ref}
        className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-8 text-center text-sm text-zinc-500"
      >
        <p className="font-medium text-zinc-700">No payment selected</p>
        <p className="mt-2 leading-relaxed">
          Tap any row on the left — we will pull up the amount, status, and the
          exact moment it finished.
        </p>
      </div>
    );
  }

  const prettyAmount = formatAmountForDisplay(record.amount, record.currency);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="rounded-2xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal-500/50"
    >
      <section
        className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
        aria-labelledby="history-detail-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h3
            id="history-detail-title"
            className="text-lg font-semibold text-zinc-900"
          >
            Payment details
          </h3>
          <button
            type="button"
            className="rounded-md text-xs font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            onClick={onClearSelection}
          >
            Clear selection
          </button>
        </div>

        <dl className="mt-6 space-y-5">
          <div>
            <dt className={checkoutLabelClass}>Reference</dt>
            <dd className="mt-1 break-all font-mono text-xs text-zinc-700">
              {record.id}
            </dd>
          </div>
          <div>
            <dt className={checkoutLabelClass}>Amount</dt>
            <dd className="mt-1 text-sm font-medium text-zinc-900">
              {prettyAmount}
            </dd>
          </div>
          <div>
            <dt className={checkoutLabelClass}>Status</dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {friendlyStatus(record.status)}
            </dd>
          </div>
          <div>
            <dt className={checkoutLabelClass}>Last update</dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {formatHistoryTimestamp(record.timestamp)}
            </dd>
          </div>
          <div>
            <dt className={checkoutLabelClass}>Attempts recorded</dt>
            <dd className="mt-1 text-sm text-zinc-800">{record.attemptCount}</dd>
          </div>
          {record.failureReason ? (
            <div>
              <dt className={checkoutLabelClass}>What went wrong</dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-700">
                {record.failureReason}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  );
});
