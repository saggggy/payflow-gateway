"use client";

import type { CardType } from "@/types";

import { CheckoutField } from "@/components/checkout-field";
import { checkoutControlClass } from "@/components/payment-ui-styles";
import type { PaymentFieldName } from "@/utils/validate-payment-fields";
import { detectCardType, maxPanLength } from "@/utils/card";

type CardInputProps = {
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
};

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
  const cvvLength = cardType === "amex" ? 4 : 3;
  const digitsTyped = cardNumberFormatted.replace(/\D/g, "");
  const schemeFromDigits = detectCardType(digitsTyped);
  const maxDigitsOnCard = maxPanLength(schemeFromDigits);
  const maxLengthInTheBox = maxDigitsOnCard === 15 ? 17 : 19;

  return (
    <div className="space-y-5">
      <CheckoutField
        label="Name on card"
        htmlFor="cardholder-name"
        error={errors.cardholderName}
        errorId="cardholder-name-error"
      >
        <input
          id="cardholder-name"
          name="cardholderName"
          autoComplete="cc-name"
          className={checkoutControlClass}
          value={cardholderName}
          onChange={(event) => {
            onTouchField("cardholderName");
            onCardholderNameChange(event.target.value);
          }}
          onBlur={() => onBlurField("cardholderName")}
          aria-invalid={errors.cardholderName ? "true" : "false"}
          aria-describedby={
            errors.cardholderName ? "cardholder-name-error" : undefined
          }
        />
      </CheckoutField>

      <CheckoutField
        label="Card number"
        htmlFor="card-number"
        error={errors.cardNumber}
        errorId="card-number-error"
      >
        <input
          id="card-number"
          name="cardNumber"
          inputMode="numeric"
          autoComplete="cc-number"
          className={checkoutControlClass}
          value={cardNumberFormatted}
          onChange={(event) => {
            onTouchField("cardNumber");
            onCardNumberChange(event.target.value);
          }}
          onBlur={() => onBlurField("cardNumber")}
          maxLength={maxLengthInTheBox}
          aria-invalid={errors.cardNumber ? "true" : "false"}
          aria-describedby={errors.cardNumber ? "card-number-error" : undefined}
        />
      </CheckoutField>

      <div className="grid grid-cols-2 gap-4">
        <CheckoutField
          label="Expires"
          htmlFor="card-expiry"
          error={errors.expiry}
          errorId="card-expiry-error"
        >
          <input
            id="card-expiry"
            name="cc-exp"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            className={checkoutControlClass}
            value={expiryRaw}
            onChange={(event) => {
              onTouchField("expiry");
              onExpiryChange(event.target.value);
            }}
            onBlur={() => onBlurField("expiry")}
            maxLength={5}
            aria-invalid={errors.expiry ? "true" : "false"}
            aria-describedby={errors.expiry ? "card-expiry-error" : undefined}
          />
        </CheckoutField>

        <CheckoutField
          label="CVV"
          htmlFor="card-cvv"
          error={errors.cvv}
          errorId="card-cvv-error"
        >
          <input
            id="card-cvv"
            name="cc-csc"
            inputMode="numeric"
            autoComplete="cc-csc"
            className={checkoutControlClass}
            value={cvv}
            onChange={(event) => {
              onTouchField("cvv");
              const digitsOnly = event.target.value.replace(/\D/g, "");
              onCvvChange(digitsOnly.slice(0, cvvLength));
            }}
            onBlur={() => onBlurField("cvv")}
            maxLength={cvvLength}
            aria-invalid={errors.cvv ? "true" : "false"}
            aria-describedby={errors.cvv ? "card-cvv-error" : undefined}
          />
        </CheckoutField>
      </div>
    </div>
  );
}
