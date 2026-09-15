# South Bay Saddlery — MVP v1

Mobile-first Next.js app for pre-owned English saddles.

- **Sell Your Saddle** — `/sell` (`/present` redirects here)
- **Collection** — `/collection`
- **Details** — `/collection/[id]` with Verified + South Bay Select badges and Stripe buy
- **Founder queue** — `/queue` (pending / approve / reject / publish). Alias: `/admin/approvals`
- **Verification** — `/verify` ($150 non-refundable + FedEx label to Jeff)

English only. No Congress mode. Jeff does not see support, photo, or shipping work — labels and checkout are automated or stubbed behind env.

Seed inventory (both published, Verified + South Bay Select):

- **JI-001** CWD SE01 17.5" 2024 · serial 114716 · $4690 · photos at `/listings/ji-001/`
- **JI-002** Voltaire Design Stuttgart 18.5" 2019 · serial 1386 · flap 3AAAR · $3850 · photos at `/listings/ji-002/`

Do not merge leftover PR #1 (generic storefront scaffold).

## Local

```bash
npm install
npm run build
npm start
```

Development: `npm run dev` (http://localhost:3000).

## Environment

| Variable | Required for live charges / labels |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe Checkout |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Buy CTA live path |
| `STRIPE_WEBHOOK_SECRET` | `/api/stripe/webhook` |
| `FEDEX_API_KEY` / `FEDEX_CLIENT_ID` / `FEDEX_ACCOUNT_NUMBER` / `FEDEX_METER_NUMBER` | Live FedEx (optional; stub returns `label queued`) |
| `NOTIFY_WEBHOOK_URL` | POST when a Sell Your Saddle submit lands (Andy/Kai). No direct Jeff email from code. |

If Stripe keys are missing, Details still shows a Buy CTA that explains checkout is in test setup. No crash. No fake live money.

Escrow model after successful checkout: funds held (`status: escrow`), 3-day return from receipt, $100 restock, seller payout 7–10 business days after close, 12% success fee. Blue Book wholesale is never shown.

## Vercel

Import the repository in Vercel. Framework preset is Next.js. Build command is `npm run build`. Stripe/FedEx/notify env vars are optional for a passing deploy.
