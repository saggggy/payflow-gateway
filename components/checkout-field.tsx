import type { ReactNode } from "react";

import {
  checkoutFieldErrorClass,
  checkoutLabelClass,
} from "@/components/payment-ui-styles";

type CheckoutFieldProps = {
  label: string;
  htmlFor: string;
  /** Shown under the control when present; linked from the input via `aria-describedby`. */
  error?: string;
  errorId: string;
  children: ReactNode;
};

/**
 * One labeled field + optional error. Keeps markup consistent across the checkout form.
 */
export function CheckoutField({
  label,
  htmlFor,
  error,
  errorId,
  children,
}: CheckoutFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className={checkoutLabelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} className={checkoutFieldErrorClass} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
