# Galela Okuhle Collection: Server

**Stack:** Node.js, Express, MongoDB (Mongoose), Google Auth, Cloudinary, deployed on Vercel.

The REST API behind the storefront. It handles products, orders and receipts, staff sign-in, image uploads and payments (PayFast, Yoco, plus WhatsApp, email and cash orders).

## Run locally

```bash
cp .env.example .env     # then fill in the values (see below)
npm install
npm run seed             # loads the 15 starting products
npm run dev              # http://localhost:5000
```

`npm run seed` only adds products that aren't there yet, so it never overwrites edits made in the dashboard. Use `npm run seed -- --reset` to force the catalogue in `src/seed/products.js` back over the seeded products.

## Environment variables

| Variable | What it's for |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign staff sessions |
| `GOOGLE_CLIENT_ID` | Google OAuth "Web application" client ID (same value as the client's `GOOGLE_CLIENT_ID`) |
| `STAFF_EMAILS` | Comma-separated Google accounts allowed into the staff dashboard |
| `CLIENT_URL` | Storefront URL(s), comma-separated. Used for CORS and payment return links |
| `SERVER_URL` | Public URL of this API. PayFast sends payment notifications here |
| `DELIVERY_FEE` | Flat delivery fee in Rand. `0` shows "to be confirmed" |
| `SHOP_WHATSAPP`, `SHOP_PHONE`, `SHOP_EMAIL` | Shop contact details |
| `CLOUDINARY_*` | Needed for uploading product photos from the dashboard |
| `PAYFAST_*` | PayFast merchant details. Leave blank to hide PayFast at checkout. `PAYFAST_SANDBOX=false` for live |
| `YOCO_SECRET_KEY`, `YOCO_WEBHOOK_SECRET` | Yoco online checkout. Leave blank to hide Yoco at checkout |

### Setting up the services

- **Google sign-in:** In Google Cloud Console → APIs & Services → Credentials, create an OAuth client ID of type *Web application*. Add the storefront URLs (e.g. `http://localhost:3000` and your Vercel domain) under **Authorised JavaScript origins**.
- **PayFast:** Use the sandbox details from sandbox.payfast.co.za to test. The notify URL is set automatically to `SERVER_URL/api/payments/payfast/notify`.
- **Yoco:** Register a webhook pointing at `SERVER_URL/api/payments/yoco/webhook` (Yoco's `POST /api/webhooks` endpoint) and put the returned secret in `YOCO_WEBHOOK_SECRET`. Orders are marked paid only by verified webhooks.

## API overview

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/config` | public | Shop contacts, delivery fee, which payment options are enabled |
| GET | `/api/products?category=bags\|cleaning&featured=true` | public | List products |
| GET | `/api/products/:slug` | public | One product |
| POST/PUT/DELETE | `/api/products[/:id]` | staff | Manage products |
| POST | `/api/uploads` | staff | Upload images to Cloudinary (multipart field `images`) |
| POST | `/api/orders` | public | Place an order. Prices are always taken from the database |
| GET | `/api/orders/:id?token=…` | customer / staff | Receipt |
| POST | `/api/orders/:id/pay?token=…` | customer | Retry an online payment |
| GET | `/api/orders?status=&q=&page=` | staff | Orders list with counts per status |
| PATCH | `/api/orders/:id` | staff | Update order status, payment status or notes |
| POST | `/api/auth/google` | public | Exchange a Google ID token for a staff session |
| POST | `/api/payments/payfast/notify` | PayFast | Payment notification (signature and server validation checked) |
| POST | `/api/payments/yoco/webhook` | Yoco | Payment webhook (signature checked) |

## Deploy to Vercel

Create a Vercel project with **Root Directory = `server`**. `vercel.json` sends every request to `api/index.js`. Add the environment variables above. In MongoDB Atlas, allow access from Vercel (Network Access → `0.0.0.0/0`, or use the Vercel integration).

## Product images

The starting product photos are in `client/public/products`. They were made with `npm run process-images -- <folder>`, which crops the supplier code and size labels and paints out the Chinese colour captions. New photos uploaded in the dashboard go to Cloudinary.
