"use client";

import { useCallback, useEffect, useRef } from "react";

import { CardInput } from "@/components/card-input";
import { CardPreview } from "@/components/card-preview";
import { CurrencyAmountFields } from "@/components/currency-amount-fields";
import { PaymentResultPanel } from "@/components/payment-result-panel";
import { ProcessingOverlay } from "@/components/processing-overlay";
import { checkoutTapButtonClass } from "@/components/payment-ui-styles";
import { usePaymentForm } from "@/hooks/use-payment-form";
import { usePaymentStore } from "@/hooks/use-payment-store";
import { detectCardType } from "@/utils/card";
import { MAX_PAY_ATTEMPTS_PER_TRANSACTION } from "@/utils/transaction-history-storage";

function hasCompleteExpiry(expiryRaw: string) {
  return expiryRaw.replace(/\D/g, "").length >= 4;
}

export function PaymentForm() {
  const primaryResultRef = useRef<HTMLButtonElement>(null);
  const retryResultRef = useRef<HTMLButtonElement>(null);
  const processingRegionRef = useRef<HTMLDivElement>(null);
  const checkoutHeadingRef = useRef<HTMLHeadingElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const form = usePaymentForm();
  const { resetFormAndSession } = form;
  const payAttemptsUsed = usePaymentStore((s) => s.payAttemptsUsed);
  const prepareRetry = usePaymentStore((s) => s.prepareRetry);

  const schemeOnCard = detectCardType(form.cardNumberDigits);
  const expiryForPreview = hasCompleteExpiry(form.expiryRaw)
    ? form.expiryRaw
    : "MM/YY";

  const isFinished =
    form.lifecycleStatus === "success" ||
    form.lifecycleStatus === "failed" ||
    form.lifecycleStatus === "timeout";

  const canTryAgain =
    (form.lifecycleStatus === "failed" || form.lifecycleStatus === "timeout") &&
    payAttemptsUsed < MAX_PAY_ATTEMPTS_PER_TRANSACTION;

  const handleRetry = useCallback(() => {
    prepareRetry();
    requestAnimationFrame(() => {
      submitButtonRef.current?.focus();
    });
  }, [prepareRetry]);

  const handleNewPayment = useCallback(() => {
    resetFormAndSession();
    requestAnimationFrame(() => {
      checkoutHeadingRef.current?.focus();
    });
  }, [resetFormAndSession]);

  useEffect(() => {
    if (!isFinished) return;
    const frame = requestAnimationFrame(() => {
      if (canTryAgain) {
        retryResultRef.current?.focus();
      } else {
        primaryResultRef.current?.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isFinished, canTryAgain, form.lifecycleStatus]);

  useEffect(() => {
    if (form.lifecycleStatus !== "processing") return;
    const frame = requestAnimationFrame(() => {
      processingRegionRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [form.lifecycleStatus]);

  return (
    <div className="grid w-full max-w-full min-w-0 items-start gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] lg:gap-14">
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
            attemptsUsed={payAttemptsUsed}
            maxAttempts={MAX_PAY_ATTEMPTS_PER_TRANSACTION}
            canTryAgain={canTryAgain}
            onRetry={handleRetry}
            onNewPayment={handleNewPayment}
            primaryRef={primaryResultRef}
            retryRef={retryResultRef}
          />
        ) : (
          <div className="relative">
            {form.lifecycleStatus === "processing" ? (
              <ProcessingOverlay ref={processingRegionRef} />
            ) : null}

            <form
              className="space-y-8 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xl shadow-zinc-900/5 sm:p-8"
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
              noValidate
              aria-labelledby="checkout-form-title"
              aria-busy={form.isSubmitting}
            >
              <header>
                <h2
                  ref={checkoutHeadingRef}
                  id="checkout-form-title"
                  tabIndex={-1}
                  className="text-lg font-semibold tracking-tight text-zinc-900 outline-none ring-teal-500/40 focus-visible:ring-2"
                >
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
                ref={submitButtonRef}
                type="submit"
                disabled={
                  !form.isFormValid ||
                  form.isSubmitting ||
                  form.lifecycleStatus !== "idle"
                }
                className={`${checkoutTapButtonClass} w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition enabled:hover:from-teal-500 enabled:hover:to-emerald-500 enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Pay securely
              </button>
            </form>
          </div>
        )}
      </div>

      <aside
        className="min-w-0 lg:sticky lg:top-8"
        aria-labelledby="card-preview-label"
      >
        <p
          id="card-preview-label"
          className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-500 lg:text-left"
        >
          Live preview
        </p>
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <CardPreview
            cardholderName={form.cardholderName}
            cardDigits={form.cardNumberDigits}
            expiryLabel={expiryForPreview}
            cardType={schemeOnCard}
            amount={form.amount}
            currency={form.currency}
          />
        </div>
      </aside>
    </div>
  );
}
