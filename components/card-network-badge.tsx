import type { CardType } from "@/types";

const label: Record<CardType, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  unknown: "Card",
};

const chipClass: Record<CardType, string> = {
  visa: "bg-[#1a1f71] text-white",
  mastercard: "bg-[#eb001b] text-white",
  amex: "bg-[#016fd0] text-white",
  unknown: "bg-zinc-500 text-white",
};

export function CardNetworkBadge({ type }: { type: CardType }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${chipClass[type]}`}
      aria-label={label[type]}
    >
      {type === "unknown" ? "—" : label[type]}
    </span>
  );
}
