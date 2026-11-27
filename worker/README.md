# GRIT payments · pay.grittech.io

Cloudflare Worker that takes payments through Ziina and delivers paid downloads.
The Ziina key and Firebase service account exist only as Worker secrets (set by CI from GitHub secrets).

## Flow
Cart → `POST /checkout` (member must be signed in) → Ziina payment page → back to `/checkout/success/?pi=…`
→ `POST /confirm` checks the payment with Ziina → purchase written to `users/{uid}/purchases/{id}` → Download buttons.
Ziina's webhook does the same fulfilment in the background, in case the buyer closes the tab.

## Selling something new
- **A product**: add it to `PRODUCTS` in `src/data.js` (price in USD) and upload `<id>.zip` to the private
  `grittech-downloads` R2 bucket. Checkout refuses products without a zip, and placeholders.
- **A package or bundle**: add a product with `includes: ['id-a', 'id-b']`. Buying it grants every included product.
- **A one-off payment link** (services, deposits, custom packages, any currency Ziina supports):
  sign in and open `/admin/links/`. Admin emails are `ADMIN_EMAILS` in `wrangler.toml`.

Prices are read from `src/data.js` at deploy time (`build-catalog.mjs`), never from the browser.
Preview links and localhost create Ziina **test** payments; only grittech.io charges real money.

## Deploy
`.github/workflows/payments.yml` deploys on changes to `worker/` or `src/data.js`, sets the secrets and registers
the Ziina webhook. `.github/workflows/downloads.yml` rebuilds and uploads `grit-ui-bundle.zip`.
GitHub secrets needed: `CLOUDFLARE_API_TOKEN`, `ZIINA_API_KEY` (plus the existing `FIREBASE_SERVICE_ACCOUNT`).
