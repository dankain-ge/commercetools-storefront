# Lifestyle & Home — commercetools B2C storefront

A Next.js 16 storefront built against the commercetools project `dan-test-build-with-ai-2`
(B2C "Lifestyle and Home" sample data), following the
[Build a storefront from scratch with AI](https://docs.commercetools.com/dev-tooling/build-with-ai-storefront-from-scratch?activePath=claude) guide.

## Run it

```bash
cd site
npm install
npm run dev        # http://localhost:3000 → redirects to /en-US
```

`site/.env` already holds the `storefront-dev` API client, a generated `SESSION_SECRET`
and `CTP_CHECKOUT_APP_KEY=demo-commercetools-checkout`. It is gitignored. `site/.env.example`
shows the shape without secrets.

## What is in here

| Path | Purpose |
|---|---|
| `.mcp.json` | Managed Commerce MCP connection for coding agents (`ct-dan-test-build-with-ai-2`). Commit it; each developer signs in with their Merchant Center account. |
| `site/` | The storefront. Next.js 16 App Router, next-intl v4, Tailwind v4, SWR, jose. |
| `site/lib/ct/*` | Server-only commercetools layer: SDK singleton, search, categories, cart, auth, orders, Checkout session. |
| `site/lib/mappers/*` | commercetools → app type mappers. Components never see SDK types. |
| `site/app/api/*` | BFF route handlers: cart, discount codes, auth, account, checkout session. The browser never talks to commercetools directly. |
| `site/app/[locale]/*` | Pages: home, category (PLP with facets), search, PDP (`/p/[sku]`), cart, checkout, confirmation, login, register, account. |
| `vercel.json`, `netlify.toml` | Deploy configs. Run `/nextjs-deploy-vercel` or `/nextjs-deploy-netlify` from the commercetools plugin. |
| `*_admin-client.env`, `storefront-dev.env` | Credentials downloaded/created during setup. Gitignored. |

Locales: `en-US` (USD), `en-GB` (GBP), `de-DE` (EUR). The URL prefix is the source of truth;
`proxy.ts` mirrors it into the `your-shop-country-locale` cookie that the BFF reads. Switching
country hides a cart in another currency and starts a fresh one.

## Verified end to end (9 Nov 2026)

- Home, category listing with facets (colour, finish, availability, price), sorting, pagination, search, PDP with variant swatches, in all three locales.
- Cart create / add / change quantity / remove, discount code `BOGO` apply and remove, 409 retry on version conflicts.
- Register, login with anonymous-cart merge, logout, profile, orders list, currency switch.
- Checkout Session creation against the `demo-commercetools-checkout` application.

Hosted Checkout widget tested in a browser on 10 Nov 2026 (de-DE): address, shipping, sample-connector card payment, order created, `checkout_completed` handled by the storefront, redirect to `/checkout/confirmation` with the order id.

## Checkout payment setup (10 Nov 2026)

The demo Checkout applications are created without a payment integration, so the hosted widget reached the
payment step and failed with a generic error (`payment-config` returned empty `paymentMethods`/`connectors`).
Fixed by:

- Installing the **Sample payment connector for checkout** (Connect marketplace, commercetools, `connect-payment-integration`)
  as a sandbox deployment with key `sample-payment-connector`. Its processor runs with the API client
  `checkout-sample-connector` (credentials in `../checkout-sample-connector.env`, gitignored).
- Adding an Active **Credit card** payment integration (`sample-card`, type `card`, web component) to
  `demo-commercetools-checkout`, and extending that application to DE, GB and US.

Test card: Visa `4111 1111 1111 1111`, any future expiry, any CVC, any name. No real payment is made.

Also fixed today: the home page looked the New Arrivals category up by its English slug, which is `ganz-neu`
in de-DE, so the German home page had no hero image or product strip. It now uses the category key.

## Known follow-ups

1. **Browser-test the hosted Checkout in en-GB and en-US** (de-DE is done).
2. The debugging route `/api/health` was removed before the first commit; do not reintroduce unauthenticated endpoints that call commercetools.
3. Attribute facets come only from product-type attributes flagged `isSearchable`; `color-code`, `finish-code`, `color-label`, `finish-label` are deliberately excluded (`lib/ct/variant-config.ts`).
4. Full-text search matches on product name only.
5. The docs page, section 6, describes a credentials-based Commerce MCP that the plugin no longer ships. The managed MCP route in `.mcp.json` is what works.

## Setup notes worth keeping

- A managed MCP server left **Disabled** in the Merchant Center accepts the OAuth sign-in but rejects every token ("rejected them on reconnect").
- Dismissing Claude Code's `.mcp.json` approval prompt with Escape records the server as Rejected in `.claude/settings.local.json`; `claude mcp reset-project-choices` clears it.
- Sample data can only be chosen when a project is created; it cannot be added later.
