"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { CurrencyCode, PaymentPayload } from "@/types";

import { usePaymentStore } from "@/hooks/use-payment-store";
import { executePaymentRequest } from "@/utils/execute-payment-request";
import { formatCardDisplay, stripNonDigits } from "@/utils/card";
import { formatExpiryInput } from "@/utils/expiry";
import { mapPayClientResultToLifecycle } from "@/utils/map-pay-result-to-lifecycle";
import {
  buildDigitsFromFormattedPan,
  splitExpiryForPayload,
  validateAllFields,
  type PaymentFieldName,
  type PaymentFieldValues,
} from "@/utils/validate-payment-fields";

export function usePaymentForm() {
  const lifecycleStatus = usePaymentStore((s) => s.lifecycleStatus);
  const statusSubtitle = usePaymentStore((s) => s.statusSubtitle);
  const lastPayErrorSource = usePaymentStore((s) => s.lastPayErrorSource);
  const activeTransactionId = usePaymentStore((s) => s.activeTransactionId);
  const setLifecycleStatus = usePaymentStore((s) => s.setLifecycleStatus);
  const ensureActiveTransactionId = usePaymentStore(
    (s) => s.ensureActiveTransactionId,
  );
  const resetPaymentSession = usePaymentStore((s) => s.resetPaymentSession);

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

  useEffect(() => {
    if (lifecycleStatus === "idle" && activeTransactionId === null) {
      ensureActiveTransactionId();
    }
  }, [lifecycleStatus, activeTransactionId, ensureActiveTransactionId]);

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

    const transactionId = ensureActiveTransactionId();

    const expiryParts = splitExpiryForPayload(expiryRaw);
    if (!expiryParts) {
      setLifecycleStatus("failed", "Invalid expiry.", "gateway");
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

    try {
      const payResult = await executePaymentRequest(payload);
      const mapped = mapPayClientResultToLifecycle(payResult);
      setLifecycleStatus(
        mapped.lifecycleStatus,
        mapped.statusSubtitle,
        mapped.errorSource,
      );
    } catch {
      setLifecycleStatus(
        "failed",
        "Something went wrong. Please try again in a moment.",
        "gateway",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amount,
    cardNumberDigits,
    cardholderName,
    currency,
    cvv,
    expiryRaw,
    ensureActiveTransactionId,
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
    lastPayErrorSource,
    activeTransactionId,
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
