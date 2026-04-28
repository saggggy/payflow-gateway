"use client";

import type { CurrencyCode } from "@/types";

import { CheckoutField } from "@/components/checkout-field";
import {
  CHEVRON_DOWN_ICON,
  checkoutControlClass,
  checkoutSelectClass,
} from "@/components/payment-ui-styles";
import type { PaymentFieldName } from "@/utils/validate-payment-fields";

type CurrencyAmountFieldsProps = {
  currency: CurrencyCode;
  onCurrencyChange: (next: CurrencyCode) => void;
  amount: string;
  onAmountChange: (next: string) => void;
  errors: Partial<Record<PaymentFieldName, string>>;
  onBlurField: (field: PaymentFieldName) => void;
  onTouchField: (field: PaymentFieldName) => void;
};

export function CurrencyAmountFields({
  currency,
  onCurrencyChange,
  amount,
  onAmountChange,
  errors,
  onBlurField,
  onTouchField,
}: CurrencyAmountFieldsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,140px)_1fr] sm:items-end">
      <CheckoutField
        label="Currency"
        htmlFor="currency"
        error={errors.currency}
        errorId="currency-error"
      >
        <select
          id="currency"
          name="currency"
          className={checkoutSelectClass}
          style={{
            backgroundImage: `url("${CHEVRON_DOWN_ICON}")`,
          }}
          value={currency}
          onChange={(event) => {
            onTouchField("currency");
            const next = event.target.value;
            if (next === "INR" || next === "USD") {
              onCurrencyChange(next);
            }
          }}
          onBlur={() => onBlurField("currency")}
          aria-invalid={errors.currency ? "true" : "false"}
          aria-describedby={errors.currency ? "currency-error" : undefined}
        >
          <option value="USD">USD — US Dollar</option>
          <option value="INR">INR — Indian Rupee</option>
        </select>
      </CheckoutField>

      <CheckoutField
        label="Amount"
        htmlFor="amount"
        error={errors.amount}
        errorId="amount-error"
      >
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          autoComplete="transaction-amount"
          placeholder="0.00"
          className={checkoutControlClass}
          value={amount}
          onChange={(event) => {
            onTouchField("amount");
            onAmountChange(event.target.value);
          }}
          onBlur={() => onBlurField("amount")}
          aria-invalid={errors.amount ? "true" : "false"}
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
      </CheckoutField>
    </div>
  );
}
