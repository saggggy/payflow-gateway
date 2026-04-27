export interface ParsedExpiry {
  month: number;
  yearTwoDigit: number;
  /** Full four-digit year */
  yearFull: number;
}

/** Parse MM/YY from raw user input (may include slash). */
export function parseExpiryInput(raw: string): ParsedExpiry | null {
  const compact = raw.replace(/\D/g, "");
  if (compact.length < 4) return null;
  const mm = Number(compact.slice(0, 2));
  const yy = Number(compact.slice(2, 4));
  if (!Number.isFinite(mm) || !Number.isFinite(yy)) return null;
  if (mm < 1 || mm > 12) return null;
  const yearFull = 2000 + yy;
  return { month: mm, yearTwoDigit: yy, yearFull };
}

/** True if expiry (last moment of month) is strictly before current month. */
export function isExpiryInPast(parsed: ParsedExpiry, now: Date = new Date()): boolean {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  if (parsed.yearFull < y) return true;
  if (parsed.yearFull > y) return false;
  return parsed.month < m;
}

export function formatExpiryInput(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
