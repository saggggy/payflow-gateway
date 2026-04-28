import { PAY_CLIENT_TIMEOUT_MS } from "@/utils/execute-payment-request";

const secondsUntilGatewayGivesUp = PAY_CLIENT_TIMEOUT_MS / 1000;

export function ProcessingOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/75 px-6 py-16 text-center backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
        aria-hidden
      />
      <p className="text-sm font-medium text-zinc-800">
        Hang tight — we are sending your payment…
      </p>
      <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
        Talking to the mock gateway. If nothing comes back in{" "}
        {secondsUntilGatewayGivesUp} seconds we’ll stop waiting so you’re never
        left staring at a spinner.
      </p>
    </div>
  );
}
