# Payflow Gateway — project setup

This document is the **single place** to clone, install, run, and sanity-check the payment-gateway assignment. For a short product blurb, see [README.md](./README.md).

## What you need first

- **Node.js** 20 LTS or newer (18 usually works; 20 is what we recommend).
- **npm** 10+ (ships with Node). `pnpm` / `yarn` / `bun` work too if you swap commands.

No `.env` file is required — the mock gateway is same-origin (`POST /api/pay`).

## Install and run

From the repository root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The checkout and history load on the home page.

### Other useful commands

| Command        | Purpose                          |
| -------------- | -------------------------------- |
| `npm run dev`  | Local dev server with hot reload |
| `npm run build` | Production bundle + typecheck   |
| `npm run start` | Serve the last `build` output  |
| `npm run lint` | ESLint                           |

## Project layout (mental map)

| Path | Role |
| ---- | ---- |
| `app/page.tsx` | Renders the checkout shell. |
| `app/layout.tsx` | Fonts, global styles, **skip link** to `#checkout-main`. |
| `app/globals.css` | Tailwind v4 entry + **reduced-motion** helper for the spinner. |
| `app/api/pay/route.ts` | Mock gateway (~60% success / ~25% failure / ~15% slow path). |
| `components/` | UI: form, preview, results, history, shared field styles. |
| `hooks/` | Zustand store, payment form logic, history ↔ disk sync. |
| `utils/` | Card/expiry/amount validation, pay client, history merge, etc. |
| `types/` | Shared TypeScript contracts. |

## Behaviour checklist (assignment crosswalk)

Use this when you review or demo the work.

- **Form** — Name, PAN, MM/YY, CVV, amount; INR + USD; live validation (touched fields); submit disabled until valid.
- **Card UX** — Spaced PAN, Visa / MC / Amex hint, past expiry rejected, CVV 3 or 4 for Amex.
- **Preview** — Live card visual tied to the form.
- **Lifecycle** — Idle → Processing (min ~2s UI) → Success / Failed / Timeout; **6s** client abort via `AbortController`.
- **Gateway** — `POST /api/pay` random outcomes; slow branch waits **8s** server-side so the client timeout path is realistic.
- **Retries** — Same `transactionId` until you start a **New payment**; **3** attempts max; copy shows where you are in the count.
- **History** — One row per id (upsert on retry); **localStorage** persistence; row click opens a readable detail pane.
- **State** — **Zustand** for lifecycle, attempts, history, selection (no Redux dependency).
- **A11y / layout** — Visible labels, `aria-describedby` on fields, `aria-busy` on the form while paying, skip link, focus moves to processing / results / history detail / heading after key transitions, **~44px** primary actions, **375px** and **1280px** friendly spacing.
- **Motion** — Spinner respects `prefers-reduced-motion` (CSS + Tailwind `motion-reduce`).

## Assumptions we made

1. **PAN validation** uses BIN heuristics and length rules, not full **Luhn** — good enough for the mock; add Luhn if you want stricter UX.
2. **“Attempt n of 3”** counts **real** posts to `/api/pay`. Client-only mistakes (like invalid expiry before the request) do not consume a slot.
3. **History** is **device-local** (`localStorage`). Clearing site data clears the ledger — same as many homework specs.
4. **Card data** is sent to this demo API only — never to a real processor.

## What we would improve with more time

- Automated tests (Playwright for the pay flow + Vitest for validators).
- Server-side idempotency keyed by `transactionId` (today the mock is stateless).
- Stricter PAN checks (Luhn + fuller BIN tables).
- i18n / locale-aware copy and number formats beyond `Intl` defaults.

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| History disappears | Browser cleared storage or private mode blocked `localStorage`. |
| Build fails on TypeScript | Run `npm install` again; ensure Node is current. |
| Skip link does not move focus | Some browsers only move **scroll** on hash links; keyboard users still reach `#checkout-main` in the tab order after activation. |

---

Questions welcome in your PR or review notes — this file is meant to read like a handover, not a legal contract.
