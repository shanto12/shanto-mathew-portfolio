# Production Evidence Matrix

Last updated: 2026-08-28 02:31 PM CDT.

## Release matrix

| Requirement | Status | Current evidence | Verification surface |
|---|---|---|---|
| Lint, typecheck, unit tests, production build | PASS | `npm run verify` completed successfully; 3 Vitest tests passed. | Local CLI |
| Local desktop/mobile browser flow | PASS | `npm run e2e` passed 2/2 projects. | Playwright Desktop Chrome + Pixel 7 |
| Production Netlify URL | PASS | `https://shanto-mathew-portfolio.netlify.app/` returned HTTP 200 after deploy `6a91e1a2aa31b9ecea62d28b`. | Netlify + curl |
| Production browser flow | PASS | Same primary-controls suite passed 2/2 against the real Netlify URL; all 9 demo links were checked for HTTP <400; the headshot image assertion passed. | Playwright production |
| Real Chrome profile final pass | PASS | User Chrome loaded the production URL; hero headshot, nav, hero CTAs, 4 delivery stages, 4 skill tabs, 4 method tabs, 5 gallery filters, contact fields, and submit flow were exercised. | User's Chrome |
| Mobile layout and overflow | PASS | Pixel 7 flow passed with no horizontal overflow; visible control sizing checks passed. | Playwright |
| Console/page/network failures | PASS | Production failure collector reported no page errors, console errors, failed requests, or same-origin HTTP 400+ responses. | Playwright production |
| `/api/health` | PASS | Returned HTTP 200 and `status: ready` from the published Netlify function. It truthfully reports registrar DNS verification as pending. | curl + Netlify Function |
| `/api/contact` | PASS | Synthetic JSON POST returned HTTP 200 and `ok: true`; no real personal data was used. | curl + Netlify Function |
| Security headers/CSP | PASS | Netlify URL includes CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy. | curl response headers |
| Production dependency audit | PASS | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities. | npm CLI |
| Professional headshot asset | PASS | The newest Downloads image was inspected, copied to `/shanto-mathew-headshot.jpeg`, rendered in the hero with accessible alt text, and returned HTTP 200 from Netlify as `image/jpeg`. | Source inspection, Chrome, curl |
| GitHub source of truth | PASS | Repository [shanto12/shanto-mathew-portfolio](https://github.com/shanto12/shanto-mathew-portfolio) is clean, pushed on `main` at commit `e92d60f`. | Git + GitHub |
| Custom domain `shantomathew.com` | BLOCKED | IONOS authoritative DNS has the correct apex A and `www` CNAME records, but the registry reports `clientHold`; public recursive resolvers and HTTPS still return NXDOMAIN. | Netlify API, authoritative `dig`, public `dig`, WHOIS |
| Registrar account access | BLOCKED | Registrar is IONOS SE. The signed-in IONOS Chrome account has one Instant Domain contract and Domain Guard, but no attached domain; searching the target says it is taken and offers transfer. No purchase or transfer was initiated. | User's Chrome + WHOIS |
| HTTPS on custom domain | BLOCKED | Cannot verify until IONOS clears `clientHold` and DNS becomes authoritative. The Netlify fallback URL is serving HTTPS correctly. | curl/DNS |
| Auth/login/logout | N/A | The public portfolio has no authentication surface. | App review |
| Backend/runner jobs | N/A | Backend is synchronous Netlify Functions only (`/api/health`, `/api/contact`). | Source + production endpoints |

## Deployment evidence

- Netlify site ID: `1b3456d2-1ff2-4dd3-b802-c6d97309336a`
- Latest production deploy ID: `6a91e1a2aa31b9ecea62d28b`
- GitHub release commit: `e92d60fce9668f05840b6dc685cdb10d8e7b9875`
- Published fallback URL: [shanto-mathew-portfolio.netlify.app](https://shanto-mathew-portfolio.netlify.app/)
- Intended custom URL: [shantomathew.com](https://shantomathew.com/) (currently DNS-blocked)
- GitHub source: [github.com/shanto12/shanto-mathew-portfolio](https://github.com/shanto12/shanto-mathew-portfolio)

## Domain evidence

- Registrar: IONOS SE.
- Domain status: `clientHold`, `clientTransferProhibited`.
- Registry expiry: `2027-05-20T20:04:32Z`.
- Nameservers: `NS1028.UI-DNS.ORG`, `NS1042.UI-DNS.DE`, `NS1065.UI-DNS.COM`, `NS1104.UI-DNS.BIZ`.
- Netlify site configuration still declares `shantomathew.com` as its custom domain and the published fallback is healthy. IONOS authoritative servers answer `shantomathew.com A 75.2.60.5` and `www.shantomathew.com CNAME shanto-mathew-portfolio.netlify.app.`; however, the parent `.com` zone returns NXDOMAIN while WHOIS reports `clientHold`, so the registrar must remove the hold before the records can be seen publicly.

## Visual evidence

- [modern-local-desktop.png](../output/playwright/modern-local-desktop.png)
- [modern-local-mobile.png](../output/playwright/modern-local-mobile.png)

The current release is a dark, high-contrast, colorful FDE portfolio with animated delivery-loop artwork, interactive stages, skills, method principles, proof metrics, demo filters, and a production contact boundary.
