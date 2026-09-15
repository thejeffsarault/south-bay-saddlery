# South Bay Saddlery — MVP v1

Mobile-first Next.js app for pre-owned English saddles.

- **Sell Your Saddle** — `/sell` (`/present` redirects here)
- **Collection** — `/collection`
- **Details** — `/collection/[id]` with Verified + South Bay Select badges and Stripe buy
- **Founder queue** — `/queue` listings + **Finance** tab. Alias: `/admin/approvals`
- **Verification** — `/verify` ($150 PaymentIntent + inbound FedEx seller → warehouse)

English only. No Congress mode. Jeff does not see support, photo, or shipping work — labels and checkout are automated or stubbed behind env.

Seed inventory (both published, Verified + South Bay Select, **platform-owned** — no Connect):

- **JI-001** CWD SE01 17.5" 2024 · serial 114716 · $4690 · photos at `/listings/ji-001/`
- **JI-002** Voltaire Design Stuttgart 18.5" 2019 · serial 1386 · flap 3AAAR · $3850 · photos at `/listings/ji-002/`

Do not merge leftover PR #1 (generic storefront scaffold).

## Stripe / escrow (CFO lock)

1. Platform Stripe account receives buyer Checkout. **No auto-transfer** to the seller on charge. Funds are held until close + a 7–10 business day payout window.
2. **Connect Express** is for C2C sellers who receive payouts. JI-001 / JI-002 skip Connect — funds stay on the platform.
3. Payout job: **net = list − 12%(list) − Stripe(PI amount)**. Stripe fee uses the full PaymentIntent (list + shipping + tax). 12% stays on item list only. Seller eats processing. Transfer only after close. Returned/refunded: skip 12% and skip Transfer; $100 restock is a separate buyer charge. Worked example $4690: Stripe ≈ $136.31, SBS 12% = $562.80, seller net ≈ $3990.89.
4. Separate **$150 Verification** Checkout/PaymentIntent (product: SBS Verification). SBS absorbs Stripe on that charge. Success creates an inbound FedEx label job seller → **South Bay Saddlery, Attn Jeff Sarault, 32 Glory Road, Santa Rosa Beach FL 32459**, receiving **9am–5pm (local)** (Jeff-locked default; `VERIFY_SHIP_TO_*` overrides). Not Inlet Beach. Warehouse is **ship/receive only — no in-person visits**.
5. **Fail-verify return:** platform books outbound FedEx to the seller. Label kind `verify_fail_return`, **billed to platform (SBS pays)**. Queue action on `/queue`. Does not block if the seller address is incomplete.
6. Webhooks write a finance log (`.data/finance.json` + `/queue` Finance tab): `payment_intent.succeeded`, `charge.refunded`, `checkout.session.completed`, Connect `account.updated`, `transfer.paid` / `transfer.failed` (plus `transfer.created` / `reversed`).
7. Buyer copy: listed price via Stripe; tax calculated at checkout; 3 days from delivery to keep/return; return = buyer pays ship + $100 restock.
   Seller copy: 12% of list; card processing deducted from payout; payout 7–10 biz days after close.
8. **$100 restock** is a separate charge on the return path. No 12% on a reversed sale.
9. **Stripe Tax = YES (Phase 1).** Checkout Sessions enable `automatic_tax` and collect a billing address. Line items use exclusive tax. If Stripe Tax is not configured on the account, Checkout retries without tax (stub/degrade). 12% success fee stays on item list only. Stripe processing is taken from the full PaymentIntent (list + shipping + tax).

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
| `STRIPE_SECRET_KEY` | Stripe Checkout, Verification PI, Transfers |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Buy CTA live path |
| `STRIPE_WEBHOOK_SECRET` | `/api/stripe/webhook` |
| `FEDEX_API_KEY` / `FEDEX_CLIENT_ID` / `FEDEX_ACCOUNT_NUMBER` / `FEDEX_METER_NUMBER` | Live FedEx (optional; stub returns `label queued`) |
| `VERIFY_SHIP_TO_NAME` / `ATTN` / `STREET` / `CITY` / `STATE` / `ZIP` / `HOURS` | Inbound verify ship-to. Defaults: South Bay Saddlery / Attn Jeff Sarault / 32 Glory Road / Santa Rosa Beach FL 32459 / 9am–5pm (local). Env overrides. Not Inlet Beach. Fail-verify returns ship to the seller. Warehouse is ship/receive only — no in-person visits. |
| `NOTIFY_WEBHOOK_URL` | POST when a Sell Your Saddle submit lands (Andy/Kai). No direct Jeff email from code. |

If Stripe keys are missing, Details still shows a Buy CTA that explains checkout is in test setup. No crash. No fake live money. Finance actions still write the ledger as stubs.

Blue Book wholesale is never shown.

## Vercel

Import the repository in Vercel. Framework preset is Next.js. Build command is `npm run build`. Stripe/FedEx/notify env vars are optional for a passing deploy.
