# South Bay Saddlery

Storefront for **South Bay Saddlery** — handcrafted saddles, tack, and leather
goods. Built with [Next.js](https://nextjs.org) (App Router), TypeScript, and
Tailwind CSS.

## Features

- Marketing home page with featured products
- Product catalog grouped by category (`/products`)
- API-backed custom-order inquiry flow (`/contact` → `POST /api/inquiries`)
- Submitted inquiries are persisted to `.data/inquiries.json`

## Getting started

Requires Node.js 20+ (developed on Node 22).

```bash
npm ci        # install dependencies
npm run dev   # start the dev server on http://localhost:3000
```

Other scripts:

```bash
npm run build # production build
npm run start # serve the production build
npm run lint  # run ESLint
```

## API

| Method | Route             | Description                          |
| ------ | ----------------- | ------------------------------------ |
| `GET`  | `/api/inquiries`  | List submitted inquiries             |
| `POST` | `/api/inquiries`  | Submit an inquiry (name, email, …)   |

## Project structure

```
app/                 App Router pages and API routes
  api/inquiries/     Inquiry submission + listing endpoint
  contact/           Custom-order form page
  products/          Product catalog page
components/          Reusable UI components
lib/                 Product data and inquiry storage
```

## Cloud Agent environment

`.cursor/environment.json` installs dependencies with `npm ci` and runs the dev
server (`npm run dev`) in a persistent terminal.
