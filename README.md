# Signature Pilot AI

Standalone Signature Pilot AI app, isolated from PulsePeak.

Scripts:
- `npm run dev`
- `npm run dev:server`
- `npm run dev:client`
- `npm run build`
- `npm run test:smoke`

Billing environment variables:
- `VITE_BUSINESS_CONTACT_EMAIL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_BUSINESS_MONTHLY_PRICE_ID` (optional; business self-serve is not live without this)
- legacy fallback support remains for `STRIPE_PRICE_ID` / `STRIPE_MONTHLY_PRICE_ID`
