"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { CurrencyCode, PaymentPayload } from "@/types";

import { usePaymentStore } from "@/hooks/use-payment-store";
import { postPayment, type PayClientResult } from "@/utils/pay-api-client";
import { formatAmountForDisplay } from "@/utils/amount";
import { formatCardDisplay, stripNonDigits } from "@/utils/card";
import { formatExpiryInput } from "@/utils/expiry";
import {
  buildDigitsFromFormattedPan,
  splitExpiryForPayload,
  validateAllFields,
  type PaymentFieldName,
  type PaymentFieldValues,
} from "@/utils/validate-payment-fields";

const MIN_PROCESSING_MS = 2000;
const CLIENT_TIMEOUT_MS = 6000;

function mapResultToLifecycle(
  result: PayClientResult,
): { status: "success" | "failed" | "timeout"; subtitle: string | null } {
  switch (result.kind) {
    case "success":
      return {
        status: "success",
        subtitle: `Paid ${formatAmountForDisplay(result.body.amount, result.body.currency)}.`,
      };
    case "failure":
      return { status: "failed", subtitle: result.body.reason };
    case "timeout":
      return {
        status: "timeout",
        subtitle: "The gateway did not respond in time. You were not charged.",
      };
    case "network":
      return { status: "failed", subtitle: result.message };
    case "invalid_json":
      return { status: "failed", subtitle: result.message };
    case "bad_status":
      return { status: "failed", subtitle: result.message };
  }
}

export function usePaymentForm() {
  const lifecycleStatus = usePaymentStore((s) => s.lifecycleStatus);
  const statusSubtitle = usePaymentStore((s) => s.statusSubtitle);
  const setLifecycleStatus = usePaymentStore((s) => s.setLifecycleStatus);
  const resetPaymentSession = usePaymentStore((s) => s.resetPaymentSession);

  const transactionIdRef = useRef<string | null>(null);

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumberFormatted, setCardNumberFormatted] = useState("");
  const [expiryRaw, setExpiryRaw] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  const [touched, setTouched] = useState<Partial<Record<PaymentFieldName, boolean>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardNumberDigits = useMemo(
    () => buildDigitsFromFormattedPan(cardNumberFormatted),
    [cardNumberFormatted],
  );

  const fieldValues = useMemo<PaymentFieldValues>(
    () => ({
      cardholderName,
      cardNumberDigits,
      expiryRaw,
      cvv,
      amount,
      currency,
    }),
    [cardholderName, cardNumberDigits, expiryRaw, cvv, amount, currency],
  );

  const allErrors = useMemo(
    () => validateAllFields(fieldValues),
    [fieldValues],
  );

  const visibleErrors = useMemo(() => {
    const out: Partial<Record<PaymentFieldName, string>> = {};
    (Object.keys(touched) as PaymentFieldName[]).forEach((key) => {
      if (touched[key] && allErrors[key]) {
        out[key] = allErrors[key];
      }
    });
    return out;
  }, [allErrors, touched]);

  const isFormValid = useMemo(
    () => Object.keys(allErrors).length === 0,
    [allErrors],
  );

  const touchField = useCallback((field: PaymentFieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const onBlurField = useCallback(
    (field: PaymentFieldName) => {
      touchField(field);
    },
    [touchField],
  );

  const resetFormAndSession = useCallback(() => {
    transactionIdRef.current = null;
    setCardholderName("");
    setCardNumberFormatted("");
    setExpiryRaw("");
    setCvv("");
    setAmount("");
    setCurrency("USD");
    setTouched({});
    resetPaymentSession();
  }, [resetPaymentSession]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !isFormValid) return;
    setIsSubmitting(true);
    setLifecycleStatus("processing", null);

    if (transactionIdRef.current === null) {
      transactionIdRef.current = crypto.randomUUID();
    }
    const transactionId = transactionIdRef.current;

    const expiryParts = splitExpiryForPayload(expiryRaw);
    if (!expiryParts) {
      setLifecycleStatus("failed", "Invalid expiry.");
      setIsSubmitting(false);
      return;
    }

    const payload: PaymentPayload = {
      transactionId,
      amount: amount.trim(),
      currency,
      cardholderName: cardholderName.trim(),
      cardNumber: cardNumberDigits,
      expiryMonth: expiryParts.expiryMonth,
      expiryYear: expiryParts.expiryYear,
      cvv: cvv.trim(),
    };

    const controller = new AbortController();
    const abortTimer = window.setTimeout(() => {
      controller.abort();
    }, CLIENT_TIMEOUT_MS);
    try {
      const payPromise = postPayment(payload, controller.signal);
      const minUiPromise = new Promise<void>((resolve) => {
        window.setTimeout(resolve, MIN_PROCESSING_MS);
      });
      const [payResult] = await Promise.all([payPromise, minUiPromise]);
      const mapped = mapResultToLifecycle(payResult);
      setLifecycleStatus(mapped.status, mapped.subtitle);
    } catch {
      setLifecycleStatus(
        "failed",
        "Something went wrong. Please try again in a moment.",
      );
    } finally {
      window.clearTimeout(abortTimer);
      setIsSubmitting(false);
    }
  }, [
    amount,
    cardNumberDigits,
    cardholderName,
    currency,
    cvv,
    expiryRaw,
    isFormValid,
    isSubmitting,
    setLifecycleStatus,
  ]);

  const setCardNumberFromRaw = useCallback((raw: string) => {
    const digits = stripNonDigits(raw);
    setCardNumberFormatted(formatCardDisplay(digits));
  }, []);

  const setExpiryFromRaw = useCallback((raw: string) => {
    setExpiryRaw(formatExpiryInput(raw));
  }, []);

  return {
    lifecycleStatus,
    statusSubtitle,
    cardholderName,
    setCardholderName,
    cardNumberFormatted,
    setCardNumberFromRaw,
    expiryRaw,
    setExpiryFromRaw,
    cvv,
    setCvv,
    amount,
    setAmount,
    currency,
    setCurrency,
    visibleErrors,
    allErrors,
    isFormValid,
    isSubmitting,
    onBlurField,
    touchField,
    handleSubmit,
    resetFormAndSession,
    cardNumberDigits,
  };
}
