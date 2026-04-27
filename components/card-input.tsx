"use client";

import type { CardType } from "@/types";

import type { PaymentFieldName } from "@/utils/validate-payment-fields";
import { detectCardType, maxPanLength } from "@/utils/card";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

interface CardInputProps {
  cardholderName: string;
  onCardholderNameChange: (value: string) => void;
  cardNumberFormatted: string;
  onCardNumberChange: (value: string) => void;
  expiryRaw: string;
  onExpiryChange: (value: string) => void;
  cvv: string;
  onCvvChange: (value: string) => void;
  errors: Partial<Record<PaymentFieldName, string>>;
  onBlurField: (field: PaymentFieldName) => void;
  onTouchField: (field: PaymentFieldName) => void;
  cardType: CardType;
}

export function CardInput({
  cardholderName,
  onCardholderNameChange,
  cardNumberFormatted,
  onCardNumberChange,
  expiryRaw,
  onExpiryChange,
  cvv,
  onCvvChange,
  errors,
  onBlurField,
  onTouchField,
  cardType,
}: CardInputProps) {
  const cvvLen = cardType === "amex" ? 4 : 3;
  const panDigits = cardNumberFormatted.replace(/\D/g, "");
  const panMaxDigits = maxPanLength(detectCardType(panDigits));

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="cardholder-name"
          className="text-sm font-medium text-zinc-800"
        >
          Name on card
        </label>
        <input
          id="cardholder-name"
          name="cardholderName"
          autoComplete="cc-name"
          className={inputClass}
          value={cardholderName}
          onChange={(e) => {
            onTouchField("cardholderName");
            onCardholderNameChange(e.target.value);
          }}
          onBlur={() => onBlurField("cardholderName")}
          aria-invalid={errors.cardholderName ? "true" : "false"}
          aria-describedby={
            errors.cardholderName ? "cardholder-name-error" : undefined
          }
        />
        {errors.cardholderName ? (
          <p
            id="cardholder-name-error"
            className="mt-1.5 text-sm text-rose-600"
            role="alert"
          >
            {errors.cardholderName}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="card-number"
          className="text-sm font-medium text-zinc-800"
        >
          Card number
        </label>
        <input
          id="card-number"
          name="cardNumber"
          inputMode="numeric"
          autoComplete="cc-number"
          className={inputClass}
          value={cardNumberFormatted}
          onChange={(e) => {
            onTouchField("cardNumber");
            onCardNumberChange(e.target.value);
          }}
          onBlur={() => onBlurField("cardNumber")}
          maxLength={panMaxDigits === 15 ? 17 : 19}
          aria-invalid={errors.cardNumber ? "true" : "false"}
          aria-describedby={errors.cardNumber ? "card-number-error" : undefined}
        />
        {errors.cardNumber ? (
          <p
            id="card-number-error"
            className="mt-1.5 text-sm text-rose-600"
            role="alert"
          >
            {errors.cardNumber}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="card-expiry"
            className="text-sm font-medium text-zinc-800"
          >
            Expires
          </label>
          <input
            id="card-expiry"
            name="cc-exp"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            className={inputClass}
            value={expiryRaw}
            onChange={(e) => {
              onTouchField("expiry");
              onExpiryChange(e.target.value);
            }}
            onBlur={() => onBlurField("expiry")}
            maxLength={5}
            aria-invalid={errors.expiry ? "true" : "false"}
            aria-describedby={errors.expiry ? "card-expiry-error" : undefined}
          />
          {errors.expiry ? (
            <p
              id="card-expiry-error"
              className="mt-1.5 text-sm text-rose-600"
              role="alert"
            >
              {errors.expiry}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="card-cvv" className="text-sm font-medium text-zinc-800">
            CVV
          </label>
          <input
            id="card-cvv"
            name="cc-csc"
            inputMode="numeric"
            autoComplete="cc-csc"
            className={inputClass}
            value={cvv}
            onChange={(e) => {
              onTouchField("cvv");
              onCvvChange(e.target.value.replace(/\D/g, "").slice(0, cvvLen));
            }}
            onBlur={() => onBlurField("cvv")}
            maxLength={cvvLen}
            aria-invalid={errors.cvv ? "true" : "false"}
            aria-describedby={errors.cvv ? "card-cvv-error" : undefined}
          />
          {errors.cvv ? (
            <p
              id="card-cvv-error"
              className="mt-1.5 text-sm text-rose-600"
              role="alert"
            >
              {errors.cvv}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
