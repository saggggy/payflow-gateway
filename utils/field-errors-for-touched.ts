import type { PaymentFieldName } from "@/utils/validate-payment-fields";

/**
 * We only surface errors for fields the shopper has already interacted with,
 * so the first screen doesn’t shout at them — errors grow in as they type or blur.
 */
export function fieldErrorsForTouchedOnly(
  touched: Partial<Record<PaymentFieldName, boolean>>,
  allErrors: Partial<Record<PaymentFieldName, string>>,
): Partial<Record<PaymentFieldName, string>> {
  const visible: Partial<Record<PaymentFieldName, string>> = {};
  for (const name of Object.keys(touched) as PaymentFieldName[]) {
    if (touched[name] && allErrors[name]) {
      visible[name] = allErrors[name];
    }
  }
  return visible;
}
