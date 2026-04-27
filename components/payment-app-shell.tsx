"use client";

import { usePaymentStore } from "@/hooks/use-payment-store";

/**
 * Phase 1 shell: confirms Zustand wiring and gives a single place for the payment UI to grow.
 */
export function PaymentAppShell() {
  const lifecycleStatus = usePaymentStore((s) => s.lifecycleStatus);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Payflow gateway
        </h1>
        <p className="text-sm text-zinc-600">
          Payment form, mock gateway, and history will be added in later phases.
        </p>
      </header>
      <section
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
        aria-label="Store status (Phase 1)"
      >
        <p>
          <span className="font-medium text-zinc-900">Lifecycle (store):</span>{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-zinc-200">
            {lifecycleStatus}
          </code>
        </p>
      </section>
    </main>
  );
}
