# Payflow Gateway

A **Next.js (App Router) + TypeScript** checkout demo: validated card form, live preview, mock `POST /api/pay` with realistic latency and failure modes, retries (same transaction id, max three tries), and **localStorage**-backed history with a detail pane. **Zustand** holds global payment + history state.

👉 **Install, run, folder map, and an assignment checklist** → see **[SETUP.md](./SETUP.md)**.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- Next.js **16**, React **19**, Tailwind **4**
- Zustand for store
- No Stripe/Razorpay/PayPal SDK — behaviour is simulated in `app/api/pay/route.ts`

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
