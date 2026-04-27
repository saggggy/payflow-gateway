"use client";

import { useEffect, useRef } from "react";

import { CardInput } from "@/components/card-input";
import { CardPreview } from "@/components/card-preview";
import { PaymentResultPanel } from "@/components/payment-result-panel";
import { usePaymentForm } from "@/hooks/use-payment-form";
import { detectCardType } from "@/utils/card";

const amountInputClass =
  "mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

export function PaymentForm() {
  const primaryResultRef = useRef<HTMLButtonElement>(null);

  const {
    lifecycleStatus,
    statusSubtitle,
    cardholderName,
    setCardholderName,
    setCardNumberFromRaw,
    cardNumberFormatted,
    expiryRaw,
    setExpiryFromRaw,
    cvv,
    setCvv,
    amount,
    setAmount,
    currency,
    setCurrency,
    visibleErrors,
    isFormValid,
    isSubmitting,
    onBlurField,
    touchField,
    handleSubmit,
    resetFormAndSession,
    cardNumberDigits,
  } = usePaymentForm();

  const cardType = detectCardType(cardNumberDigits);
  const expiryLabel =
    expiryRaw.replace(/\D/g, "").length >= 4 ? expiryRaw : "MM/YY";

  const isTerminal =
    lifecycleStatus === "success" ||
    lifecycleStatus === "failed" ||
    lifecycleStatus === "timeout";

  useEffect(() => {
    if (!isTerminal) return;
    const id = requestAnimationFrame(() => {
      primaryResultRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isTerminal, lifecycleStatus]);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-14">
      <div className="relative min-w-0">
        {isTerminal ? (
          <PaymentResultPanel
            status={lifecycleStatus}
            subtitle={statusSubtitle}
            primaryRef={primaryResultRef}
            onNewPayment={resetFormAndSession}
          />
        ) : (
          <div className="relative">
            {lifecycleStatus === "processing" ? (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/75 px-6 py-16 text-center backdrop-blur-sm"
                aria-live="polite"
                aria-busy="true"
              >
                <span
                  className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
                  aria-hidden
                />
                <p className="text-sm font-medium text-zinc-800">
                  Processing payment…
                </p>
                <p className="max-w-xs text-xs text-zinc-500">
                  Securely contacting the mock gateway. This usually takes a couple
                  of seconds.
                </p>
              </div>
            ) : null}

            <form
              className="space-y-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-900/5 sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              noValidate
            >
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Payment details
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  All fields are validated locally. Card data is sent only to this
                  demo&apos;s mock API.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-[minmax(0,140px)_1fr] sm:items-end">
                <div>
                  <label
                    htmlFor="currency"
                    className="text-sm font-medium text-zinc-800"
                  >
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    className={`${amountInputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    }}
                    value={currency}
                    onChange={(e) => {
                      touchField("currency");
                      const v = e.target.value;
                      if (v === "INR" || v === "USD") {
                        setCurrency(v);
                      }
                    }}
                    onBlur={() => onBlurField("currency")}
                    aria-invalid={visibleErrors.currency ? "true" : "false"}
                    aria-describedby={
                      visibleErrors.currency ? "currency-error" : undefined
                    }
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                  {visibleErrors.currency ? (
                    <p
                      id="currency-error"
                      className="mt-1.5 text-sm text-rose-600"
                      role="alert"
                    >
                      {visibleErrors.currency}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium text-zinc-800"
                  >
                    Amount
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="transaction-amount"
                    placeholder="0.00"
                    className={amountInputClass}
                    value={amount}
                    onChange={(e) => {
                      touchField("amount");
                      setAmount(e.target.value);
                    }}
                    onBlur={() => onBlurField("amount")}
                    aria-invalid={visibleErrors.amount ? "true" : "false"}
                    aria-describedby={
                      visibleErrors.amount ? "amount-error" : undefined
                    }
                  />
                  {visibleErrors.amount ? (
                    <p
                      id="amount-error"
                      className="mt-1.5 text-sm text-rose-600"
                      role="alert"
                    >
                      {visibleErrors.amount}
                    </p>
                  ) : null}
                </div>
              </div>

              <CardInput
                cardholderName={cardholderName}
                onCardholderNameChange={setCardholderName}
                cardNumberFormatted={cardNumberFormatted}
                onCardNumberChange={setCardNumberFromRaw}
                expiryRaw={expiryRaw}
                onExpiryChange={setExpiryFromRaw}
                cvv={cvv}
                onCvvChange={setCvv}
                errors={visibleErrors}
                onBlurField={onBlurField}
                onTouchField={touchField}
                cardType={cardType}
              />

              <button
                type="submit"
                disabled={
                  !isFormValid || isSubmitting || lifecycleStatus !== "idle"
                }
                className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition enabled:hover:from-teal-500 enabled:hover:to-emerald-500 enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pay securely
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="min-w-0 lg:sticky lg:top-8">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-500 lg:text-left">
          Live preview
        </p>
        <CardPreview
          cardholderName={cardholderName}
          cardDigits={cardNumberDigits}
          expiryLabel={expiryLabel}
          cardType={cardType}
          amount={amount}
          currency={currency}
        />
      </div>
    </div>
  );
}
