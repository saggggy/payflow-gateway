"use client";

import { forwardRef } from "react";

import { PAY_CLIENT_TIMEOUT_MS } from "@/utils/execute-payment-request";

const secondsUntilGatewayGivesUp = PAY_CLIENT_TIMEOUT_MS / 1000;

/**
 * Shown while the mock gateway runs. Receives a ref so the page can move focus
 * here for screen-reader users the moment processing starts.
 */
export const ProcessingOverlay = forwardRef<HTMLDivElement>(
  function ProcessingOverlay(_, ref) {
    return (
      <div
        ref={ref}
        tabIndex={-1}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/75 px-6 py-16 text-center backdrop-blur-sm outline-none ring-teal-500/40 focus-visible:ring-2"
        aria-live="polite"
        aria-busy="true"
        role="status"
        aria-label="Processing payment"
      >
        <span
          className="payflow-spinner h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent motion-reduce:animate-none motion-reduce:border-teal-700"
          aria-hidden
        />
        <p className="text-sm font-medium text-zinc-800">
          Hang tight — we are sending your payment…
        </p>
        <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
          Talking to the mock gateway. If nothing comes back in{" "}
          {secondsUntilGatewayGivesUp} seconds we will stop waiting so you are
          never left staring at a spinner.
        </p>
        <p className="hidden max-w-xs text-xs text-zinc-500 motion-reduce:block">
          Animations are toned down on your device, but the payment is still
          running in the background.
        </p>
      </div>
    );
  },
);

ProcessingOverlay.displayName = "ProcessingOverlay";