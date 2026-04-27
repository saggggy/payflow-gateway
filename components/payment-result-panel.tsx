"use client";

import type { RefObject } from "react";

import type { PaymentStatus } from "@/types";

interface PaymentResultPanelProps {
  status: Extract<PaymentStatus, "success" | "failed" | "timeout">;
  subtitle: string | null;
  primaryRef: RefObject<HTMLButtonElement | null>;
  onNewPayment: () => void;
}

export function PaymentResultPanel({
  status,
  subtitle,
  primaryRef,
  onNewPayment,
}: PaymentResultPanelProps) {
  const title =
    status === "success"
      ? "Payment successful"
      : status === "failed"
        ? "Payment did not go through"
        : "Request timed out";

  const ring =
    status === "success"
      ? "ring-emerald-500/20 bg-emerald-50/90"
      : status === "failed"
        ? "ring-rose-500/20 bg-rose-50/90"
        : "ring-amber-500/25 bg-amber-50/90";

  return (
    <section
      className={`rounded-2xl p-8 shadow-lg ring-1 ${ring}`}
      aria-live="polite"
      aria-labelledby="payment-result-title"
    >
      <h2
        id="payment-result-title"
        className="text-xl font-semibold tracking-tight text-zinc-900"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-700">{subtitle}</p>
      ) : null}
      <button
        ref={primaryRef}
        type="button"
        className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:w-auto"
        onClick={onNewPayment}
      >
        New payment
      </button>
    </section>
  );
}
