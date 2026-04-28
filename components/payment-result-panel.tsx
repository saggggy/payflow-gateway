"use client";

import type { RefObject } from "react";

import type { PaymentStatus } from "@/types";

type PayErrorSource = "none" | "network" | "gateway" | "timeout";

type PaymentResultPanelProps = {
  status: Extract<PaymentStatus, "success" | "failed" | "timeout">;
  subtitle: string | null;
  errorSource: PayErrorSource;
  transactionId: string | null;
  attemptsUsed: number;
  maxAttempts: number;
  canTryAgain: boolean;
  onRetry: () => void;
  onNewPayment: () => void;
  primaryRef: RefObject<HTMLButtonElement | null>;
  retryRef: RefObject<HTMLButtonElement | null>;
};

export function PaymentResultPanel({
  status,
  subtitle,
  errorSource,
  transactionId,
  attemptsUsed,
  maxAttempts,
  canTryAgain,
  onRetry,
  onNewPayment,
  primaryRef,
  retryRef,
}: PaymentResultPanelProps) {
  const title =
    status === "success"
      ? "You are all set"
      : status === "failed"
        ? "This payment did not land"
        : "We stopped waiting on the bank";

  const ring =
    status === "success"
      ? "ring-emerald-500/20 bg-emerald-50/90"
      : status === "failed"
        ? "ring-rose-500/20 bg-rose-50/90"
        : "ring-amber-500/25 bg-amber-50/90";

  const ranOutOfTries =
    (status === "failed" || status === "timeout") &&
    attemptsUsed >= maxAttempts;

  const triesLeft = Math.max(0, maxAttempts - attemptsUsed);

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

      {status === "failed" && errorSource === "network" ? (
        <p className="mt-3 inline-flex rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-900 ring-1 ring-rose-200">
          This looks like a network hiccup — not your card saying no.
        </p>
      ) : null}

      {status !== "success" && attemptsUsed > 0 ? (
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Attempt {attemptsUsed} of {maxAttempts}
        </p>
      ) : null}

      {subtitle ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-700">{subtitle}</p>
      ) : null}

      {canTryAgain && attemptsUsed > 0 ? (
        <p className="mt-2 text-sm text-zinc-600">
          You still have {triesLeft} more shot{triesLeft === 1 ? "" : "s"} with
          this same payment reference — no duplicate rows in your history.
        </p>
      ) : null}

      {ranOutOfTries ? (
        <p className="mt-3 rounded-lg bg-zinc-100 px-3 py-2 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-200">
          All three tries are used up for this reference. Start a brand-new
          payment when you are ready — we will mint a fresh id so the ledger
          stays tidy.
        </p>
      ) : null}

      {transactionId ? (
        <p className="mt-4 break-all font-mono text-xs text-zinc-500">
          <span className="font-sans font-medium text-zinc-600">
            Transaction ID:{" "}
          </span>
          {transactionId}
        </p>
      ) : null}

      <div
        className={`mt-8 flex flex-col gap-3 sm:flex-row ${canTryAgain ? "sm:justify-between" : ""}`}
      >
        {canTryAgain ? (
          <button
            ref={retryRef}
            type="button"
            className="inline-flex w-full items-center justify-center rounded-xl border border-teal-600 bg-white px-4 py-3 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
            onClick={onRetry}
          >
            Try again
          </button>
        ) : null}
        <button
          ref={primaryRef}
          type="button"
          className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:w-auto"
          onClick={onNewPayment}
        >
          New payment
        </button>
      </div>
    </section>
  );
}
