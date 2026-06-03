# Zero — Admin Panel

React + Vite + Ant Design dashboard for the Zero platform.

## Setup
```bash
cp .env.example .env       # VITE_API_URL=http://localhost:4000/api/v1
npm install
npm run dev                # http://localhost:5173
```

## Login
Admin logs in with phone OTP (same flow as the app). The seeded admin phone is
`9999900000`; in dev the OTP is printed in the **backend console**. Only `role=admin`
accounts can sign in here.

## Features
- **Dashboard** — orders / customers / products / revenue + recent orders
- **Products** — full CRUD with multilingual (en/hi) name & description, price/MRP/stock/image
- **Categories** — CRUD (multilingual)
- **Orders** — list, detail drawer, change status (pending → … → delivered)
- **Customers** — list
- **Banners** — home-carousel CRUD (image, multilingual title, action)
- **Service Areas** — add/remove deliverable pincodes
- **Settings** — delivery fee, free-delivery threshold, min order, support phone, store name (multilingual)
- **Language toggle** — English / हिंदी (top-right)

## Stack notes
- Data fetching via `@tanstack/react-query`
- `src/api/client.ts` attaches the JWT + `x-lang` header and unwraps the `{ data }` envelope
- Theme primary color matches the app (`#0f9d58`)
# zero-mart-admin
