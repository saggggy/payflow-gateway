/** Shared Tailwind tokens so every checkout control feels the same. */

export const checkoutLabelClass = "text-sm font-medium text-zinc-800";

export const checkoutControlClass =
  "mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

export const checkoutFieldErrorClass = "mt-1.5 text-sm text-rose-600";

/** Native select: hide default arrow and draw our own so it matches text fields. */
export const checkoutSelectClass = `${checkoutControlClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`;

export const CHEVRON_DOWN_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E";
