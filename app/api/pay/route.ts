import { NextResponse } from "next/server";

/**
 * Mock payment gateway (Phase 2+). Phase 1: route exists so the App Router tree matches the plan.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Payment gateway not implemented yet." },
    { status: 501 },
  );
}
