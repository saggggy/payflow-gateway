"use client";

import { PaymentForm } from "@/components/payment-form";
import { TransactionHistorySection } from "@/components/transaction-history-section";

export function PaymentAppShell() {
  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-100 via-white to-teal-50/40">
      <main
        id="checkout-main"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-3 py-8 outline-none sm:px-6 sm:py-10 lg:px-8 lg:py-14"
      >
        <header className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Checkout
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Pay with confidence
          </h1>
          <p className="text-base leading-relaxed text-zinc-600">
            A focused payment experience—clear validation, a live card preview, a
            simulated gateway, and a little ledger that remembers what happened.
            No third-party checkout SDK required.
          </p>
        </header>

        <PaymentForm />
        <TransactionHistorySection />
      </main>
    </div>
  );
}
