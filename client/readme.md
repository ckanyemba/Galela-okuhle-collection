# Galela Okuhle Collection: Client

**Stack:** Next.js (App Router) + Tailwind CSS, deployed on Vercel.

The storefront and staff dashboard.

## Pages

- `/` home · `/shop?category=bags|cleaning` · `/product/[slug]`
- `/cart` → `/checkout`: customer details, collection or delivery, and payment method (PayFast, Yoco, WhatsApp, email or cash)
- `/order/[id]?token=…`: the customer's receipt. It can be printed or saved as PDF, has "Send on WhatsApp" / "Email my order" buttons, and "Pay now" to retry an online payment
- `/staff/login`: Google sign-in, linked from the bottom of every page
- `/staff`: orders dashboard with status tabs and search. It refreshes every 30 seconds
- `/staff/orders/[id]`: receipt, change status or payment, private notes, WhatsApp the customer
- `/staff/products`: add, edit or delete products, mark them sold out, upload photos

## Run locally

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm install
npm run dev                  # http://localhost:3000 (start the server too)
```

## Deploy to Vercel

Create a Vercel project with **Root Directory = `client`** and set:

- `NEXT_PUBLIC_API_URL`: the deployed server URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: same as the server's `GOOGLE_CLIENT_ID`

Then add the client's Vercel URL to the server's `CLIENT_URL`, and to the Google OAuth client's Authorised JavaScript origins.
