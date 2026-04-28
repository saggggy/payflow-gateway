"use client";

import { useEffect, useRef } from "react";

import { CardInput } from "@/components/card-input";
import { CardPreview } from "@/components/card-preview";
import { CurrencyAmountFields } from "@/components/currency-amount-fields";
import { PaymentResultPanel } from "@/components/payment-result-panel";
import { ProcessingOverlay } from "@/components/processing-overlay";
import { usePaymentForm } from "@/hooks/use-payment-form";
import { detectCardType } from "@/utils/card";

function hasCompleteExpiry(expiryRaw: string) {
  return expiryRaw.replace(/\D/g, "").length >= 4;
}

export function PaymentForm() {
  const primaryResultRef = useRef<HTMLButtonElement>(null);

  const form = usePaymentForm();

  const schemeOnCard = detectCardType(form.cardNumberDigits);
  const expiryForPreview = hasCompleteExpiry(form.expiryRaw)
    ? form.expiryRaw
    : "MM/YY";

  const isFinished =
    form.lifecycleStatus === "success" ||
    form.lifecycleStatus === "failed" ||
    form.lifecycleStatus === "timeout";

  useEffect(() => {
    if (!isFinished) return;
    const frame = requestAnimationFrame(() => {
      primaryResultRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isFinished, form.lifecycleStatus]);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-14">
      <div className="relative min-w-0">
        {isFinished ? (
          <PaymentResultPanel
            status={
              form.lifecycleStatus === "success"
                ? "success"
                : form.lifecycleStatus === "failed"
                  ? "failed"
                  : "timeout"
            }
            subtitle={form.statusSubtitle}
            errorSource={form.lastPayErrorSource}
            transactionId={form.activeTransactionId}
            primaryRef={primaryResultRef}
            onNewPayment={form.resetFormAndSession}
          />
        ) : (
          <div className="relative">
            {form.lifecycleStatus === "processing" ? <ProcessingOverlay /> : null}

            <form
              className="space-y-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-900/5 sm:p-8"
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
              noValidate
            >
              <header>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Payment details
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  We check everything in the browser first. Only this demo&apos;s
                  mock API ever sees your card details.
                </p>
                {form.activeTransactionId ? (
                  <p className="mt-3 break-all font-mono text-[11px] leading-relaxed text-zinc-400">
                    <span className="font-sans font-medium text-zinc-500">
                      Session reference:{" "}
                    </span>
                    {form.activeTransactionId}
                  </p>
                ) : null}
              </header>

              <CurrencyAmountFields
                currency={form.currency}
                onCurrencyChange={form.setCurrency}
                amount={form.amount}
                onAmountChange={form.setAmount}
                errors={form.visibleErrors}
                onBlurField={form.onBlurField}
                onTouchField={form.touchField}
              />

              <CardInput
                cardholderName={form.cardholderName}
                onCardholderNameChange={form.setCardholderName}
                cardNumberFormatted={form.cardNumberFormatted}
                onCardNumberChange={form.setCardNumberFromRaw}
                expiryRaw={form.expiryRaw}
                onExpiryChange={form.setExpiryFromRaw}
                cvv={form.cvv}
                onCvvChange={form.setCvv}
                errors={form.visibleErrors}
                onBlurField={form.onBlurField}
                onTouchField={form.touchField}
                cardType={schemeOnCard}
              />

              <button
                type="submit"
                disabled={
                  !form.isFormValid ||
                  form.isSubmitting ||
                  form.lifecycleStatus !== "idle"
                }
                className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition enabled:hover:from-teal-500 enabled:hover:to-emerald-500 enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pay securely
              </button>
            </form>
          </div>
        )}
      </div>

      <aside className="min-w-0 lg:sticky lg:top-8">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-500 lg:text-left">
          Live preview
        </p>
        <CardPreview
          cardholderName={form.cardholderName}
          cardDigits={form.cardNumberDigits}
          expiryLabel={expiryForPreview}
          cardType={schemeOnCard}
          amount={form.amount}
          currency={form.currency}
        />
      </aside>
    </div>
  );
}
