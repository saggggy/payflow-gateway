"use client";

import type { CardType, CurrencyCode } from "@/types";

import { CardNetworkBadge } from "@/components/card-network-badge";
import { digitsToPreviewDisplay } from "@/utils/card";
import { formatAmountForDisplay } from "@/utils/amount";

/** ISO-style card aspect (~85.6 × 53.98 mm). */
const CARD_ASPECT_CLASS = "aspect-[1.586/1]";

const CARD_FACE_GRADIENT =
  "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0c4a6e 100%)";

const CARD_SHINE_OVERLAY =
  "radial-gradient(circle at 80% 20%, rgba(56,189,248,0.35), transparent 50%), radial-gradient(circle at 10% 90%, rgba(16,185,129,0.25), transparent 45%)";

type CardPreviewProps = {
  cardholderName: string;
  cardDigits: string;
  expiryLabel: string;
  cardType: CardType;
  amount: string;
  currency: CurrencyCode;
};

function placeholderName(cardholderName: string) {
  const trimmed = cardholderName.trim();
  if (trimmed.length === 0) return "YOUR NAME";
  return trimmed.toUpperCase();
}

export function CardPreview({
  cardholderName,
  cardDigits,
  expiryLabel,
  cardType,
  amount,
  currency,
}: CardPreviewProps) {
  const numberLine = digitsToPreviewDisplay(cardDigits);
  const nameLine = placeholderName(cardholderName);
  const amountLine = formatAmountForDisplay(amount, currency);

  return (
    <div
      className={`relative ${CARD_ASPECT_CLASS} w-full max-w-md select-none rounded-2xl p-6 text-white shadow-2xl ring-1 ring-white/10`}
      style={{ background: CARD_FACE_GRADIENT }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
        style={{ background: CARD_SHINE_OVERLAY }}
      />
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className="h-10 w-14 rounded-md bg-gradient-to-br from-amber-200/90 to-amber-400/80 shadow-inner ring-1 ring-black/10"
            aria-hidden
          />
          <CardNetworkBadge type={cardType} />
        </div>
        <p className="font-mono text-lg tracking-[0.2em] text-white/95 sm:text-xl">
          {numberLine}
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-6 text-xs uppercase tracking-widest text-white/70">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[9px] font-medium text-white/50">Cardholder</p>
            <p className="truncate text-sm font-medium tracking-wide text-white">
              {nameLine}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[9px] font-medium text-white/50">Expires</p>
            <p className="font-mono text-sm text-white">{expiryLabel}</p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[9px] font-medium text-white/50">Amount</p>
            <p className="text-sm font-semibold tabular-nums text-emerald-200">
              {amountLine}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
