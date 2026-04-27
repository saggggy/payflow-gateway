import { NextResponse } from "next/server";

import { parsePaymentPayloadFromUnknown } from "@/utils/payment-payload";

const FAILURE_REASONS = [
  "Insufficient funds",
  "Card declined",
  "Do not honor",
  "Issuer unavailable",
  "Security violation",
] as const;

export async function POST(request: Request) {
  let unknownBody: unknown;
  try {
    unknownBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parsePaymentPayloadFromUnknown(unknownBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const payload = parsed.payload;
  const roll = Math.random();

  if (roll < 0.6) {
    return NextResponse.json({
      outcome: "success",
      transactionId: payload.transactionId,
      amount: payload.amount,
      currency: payload.currency,
    });
  }

  if (roll < 0.85) {
    const reason =
      FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    return NextResponse.json({
      outcome: "failure",
      transactionId: payload.transactionId,
      reason,
    });
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 8000);
  });

  return NextResponse.json({
    outcome: "success",
    transactionId: payload.transactionId,
    amount: payload.amount,
    currency: payload.currency,
  });
}
