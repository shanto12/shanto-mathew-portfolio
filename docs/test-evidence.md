# Production Evidence Matrix

Last updated: 2026-08-28 02:48 PM CDT.

## Release matrix

| Requirement | Status | Current evidence | Verification surface |
|---|---|---|---|
| Lint, typecheck, unit tests, production build | PASS | `npm run verify` completed successfully; 4 Vitest tests passed. | Local CLI |
| Local desktop/mobile browser flow | PASS | `npm run e2e` passed 2/2 projects after exercising the updated relay, featured work, and contact shortcuts. | Playwright Desktop Chrome + Pixel 7 |
| Production Netlify URL | PASS | `https://shanto-mathew-portfolio.netlify.app/` returned HTTP 200 after deploy `6a91e592af4b5c20a2e025bd`. | Netlify + curl |
| Production browser flow | PASS | Updated primary-controls suite passed 2/2 against the real Netlify URL; all 9 demo links were checked for HTTP <400; the header and hero headshot assertions passed; no page errors, console errors, failed requests, or same-origin HTTP 400+ responses were recorded. | Playwright production |
| Real Chrome profile final pass | PASS | User Chrome loaded the fresh production URL; both headshot placements, nav, hero CTAs, 4 delivery stages, 5 agent relay tabs, 4 skill tabs, 4 method tabs, 5 gallery filters, 4 contact shortcuts, contact fields, and synthetic submit flow were exercised. Chrome reported `scrollWidth 1425` vs `innerWidth 1440`. | User's Chrome |
| Mobile layout and overflow | PASS | Pixel 7 flow passed with no horizontal overflow; visible control sizing checks passed. | Playwright |
| Console/page/network failures | PASS | Production failure collector reported no page errors, console errors, failed requests, or same-origin HTTP 400+ responses. | Playwright production |
| `/api/health` | PASS | Returned HTTP 200 and `status: ready` from the published Netlify function. It truthfully reports registrar DNS verification as pending. | curl + Netlify Function |
| `/api/contact` | PASS | Synthetic JSON POST returned HTTP 200 and `ok: true`; no real personal data was used. | curl + Netlify Function |
| Security headers/CSP | PASS | Netlify URL includes CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy. | curl response headers |
| Production dependency audit | PASS | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities. | npm CLI |
| Professional headshot asset | PASS | The newest Downloads image was inspected, copied to `/shanto-mathew-headshot.jpeg`, rendered in the hero with accessible alt text, and returned HTTP 200 from Netlify as `image/jpeg`. | Source inspection, Chrome, curl |
| Resume/LinkedIn positioning | PASS | The attached current FDE resume and signed-in live LinkedIn profile were reviewed; public copy now leads with `Forward Deployed AI Engineer`, production GenAI for enterprise banking, AI-enhanced security operations, SOAR, agentic AI, and the supported proof metrics. | Resume PDF + user's LinkedIn in Chrome |
| Agent relay and quick-start intents | PASS | Interactive relay now surfaces Grok Bot, Claude Code, Codex, OpenClaw, and Hermes agents; contact shortcuts prefill context and a clean message without duplicate wording. | Unit tests, Playwright, user's Chrome |
| GitHub source of truth | PASS | Repository [shanto12/shanto-mathew-portfolio](https://github.com/shanto12/shanto-mathew-portfolio) is clean, pushed on `main` at commit `66b3c2c6f85b5640fde22d2a45ab83b9c0c5cc6b`. | Git + GitHub |
| Custom domain `shantomathew.com` | BLOCKED | IONOS authoritative DNS has the correct apex A and `www` CNAME records, but the registry reports `clientHold`; public recursive resolvers and HTTPS still return NXDOMAIN. | Netlify API, authoritative `dig`, public `dig`, WHOIS |
| Registrar account access | BLOCKED | Registrar is IONOS SE. The signed-in IONOS Chrome account has one Instant Domain contract and Domain Guard, but no attached domain; searching the target says it is taken and offers transfer. No purchase or transfer was initiated. | User's Chrome + WHOIS |
| HTTPS on custom domain | BLOCKED | Cannot verify until IONOS clears `clientHold` and DNS becomes authoritative. The Netlify fallback URL is serving HTTPS correctly. | curl/DNS |
| Auth/login/logout | N/A | The public portfolio has no authentication surface. | App review |
| Backend/runner jobs | N/A | Backend is synchronous Netlify Functions only (`/api/health`, `/api/contact`). | Source + production endpoints |

## Deployment evidence

- Netlify site ID: `1b3456d2-1ff2-4dd3-b802-c6d97309336a`
- Latest production deploy ID: `6a91e592af4b5c20a2e025bd`
- GitHub release commit: `66b3c2c6f85b5640fde22d2a45ab83b9c0c5cc6b`
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

The current release is a dark, high-contrast, colorful FDE portfolio with animated delivery-loop artwork, a dual headshot presence, resume-backed proof metrics, interactive agent relay, featured work spotlight, quick-start contact intents, skills, method principles, demo filters, and a production contact boundary.
