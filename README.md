# South Bay Saddlery — Congress MVP

Mobile Next.js app for **pre-owned English saddles**. This is not a generic `/products` or `/contact` inquiry storefront.

- **Present Your Saddle** — `/present`
- **Explore the Collection** — `/collection`
- **Details** — `/collection/[id]` (H1 is the saddle name, never “Dossier”). Published CWD: `/collection/ji-001`
- **Founder queue** — `/queue` (Jeff price / route / publish). Alias: `/admin/approvals`
- **Consultation stub** — `/consultation` (Home + Details CTA)

No payments, messaging, Western inventory, or product-grid storefront in this slice. `/products` and `/contact` redirect into the Collection and consultation stub.

## Local

```bash
npm install
npm run build
npm start
```

Development: `npm run dev` (http://localhost:3000).

## Vercel

Import the repository in Vercel. Framework preset is Next.js. Build command is `npm run build`. No environment variables are required for the MVP.
