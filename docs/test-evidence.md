# Test Evidence

Last updated: 2026-05-20 05:04 PM CDT.

## Release Matrix

| Requirement | Status | Evidence | Notes |
|---|---|---|---|
| Local lint/type/unit/build | Pass | `npm run verify:release` | Lint, typecheck, 3 Vitest tests, production build, desktop/mobile Playwright, and prod audit passed. |
| Local browser desktop/mobile | Pass | `npm run e2e` inside `verify:release` | Desktop and mobile clicked visible local controls, filters, contact workflow, and checked overflow and target sizes. |
| Netlify production URL | Pass | `npm run verify:production`; `curl -I https://shanto-mathew-portfolio.netlify.app/` | Netlify URL returned HTTP 200 and passed desktop/mobile Playwright. |
| Custom domain production URL | Pass | `PLAYWRIGHT_BASE_URL=https://shantomathew.com npx playwright test`; `curl -I https://shantomathew.com/` | Apex returned HTTP 200 from Netlify and passed desktop/mobile Playwright. |
| `www` redirect | Pass | `curl -I https://www.shantomathew.com/` | HTTP 301 redirects to `https://shantomathew.com/`. |
| `/api/health` backend | Pass | `curl https://shantomathew.com/api/health` | Returned `status: ready`, `mode: portfolio-production-boundary`, and `customDomain: DNS and HTTPS verified`. |
| `/api/contact` backend | Pass | JSON POST to `https://shantomathew.com/api/contact` | Returned `ok: true` and production validation message. |
| Netlify Forms capture | Pass | Encoded POST to `/`; Netlify plugin `get-forms-for-project` | POST returned HTTP 200 thank-you page. Netlify form `portfolio-contact` exists with honeypot and `submission_count: 10`; `last_submission_at: 2026-05-20T21:54:18.693+00:00`. |
| Real Chrome profile final pass | Pass | Computer Use on the user's actual Google Chrome profile | Loaded production site, clicked nav/demo filters, filled the contact form, submitted it, and observed the production success message. LastPass/password-manager extension was present; no login/auth workflow exists. |
| Primary controls and workflows | Pass | Updated Playwright suite plus real Chrome pass | Desktop clicks top nav sections; desktop/mobile click hero CTAs, all demo filters, contact form, and submit. Production tests verify all 9 visible Netlify demo URLs are reachable. |
| Demo links | Pass | Production Playwright URL checks and standalone fetch pass | All 9 linked Netlify demos returned HTTP 200. |
| Desktop layout | Pass | Playwright desktop project, real Chrome desktop | No horizontal overflow; visible target sizes meet thresholds. |
| Mobile layout | Pass | Playwright mobile project | Single-column mobile path passes without overflow; desktop-only nav is intentionally hidden. |
| Console, page, and network errors | Pass | Playwright failure collectors in production tests | Production tests fail on own-site `pageerror`, console error, failed request, or HTTP 400+ response; none occurred. |
| Security headers and CSP | Pass | `curl -I https://shantomathew.com/` | CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, and `nosniff` present. |
| HTTPS certificate | Pass | `openssl s_client -servername shantomathew.com` | Certificate subject `CN=shantomathew.com`; SAN includes `DNS:shantomathew.com` and `DNS:www.shantomathew.com`. |
| DNS | Pass | `dig` | Apex A record resolves to `75.2.60.5`; `www` CNAME resolves to `shanto-mathew-portfolio.netlify.app`. |
| Production npm audit | Pass | `npm audit --omit=dev` | Found 0 vulnerabilities. |
| GitHub source | Pass | `https://github.com/shanto12/shanto-mathew-portfolio` | Standalone app repo pushed under `shanto12`; parent demo factory docs were not pushed. |
| Auth/login/logout | Not applicable | App review | The portfolio has no authentication surface. |
| Backend/runner jobs | Not applicable | App review | Backend consists of synchronous Netlify Functions only: `/api/health` and `/api/contact`. |

## Deployment Evidence

- Netlify site ID: `1b3456d2-1ff2-4dd3-b802-c6d97309336a`.
- Latest production deploy ID: `6a0e2d2ffabb5714e3ad086b`.
- Latest build ID: `6a0e2d2ffabb5714e3ad0869`.
- Primary site URL: `https://shantomathew.com`.
- Netlify URL: `https://shanto-mathew-portfolio.netlify.app`.
- GitHub repo: `https://github.com/shanto12/shanto-mathew-portfolio`.

## Demo URL Reachability

All linked demo websites returned HTTP 200 during the final production pass:

| Demo | URL |
|---|---|
| SOC AI Agent Demo | `https://security-ops-playbook-analyzer.netlify.app/` |
| Grok Medical Front Desk | `https://grok-medical-frontdesk.netlify.app/` |
| Grok Experience Navigator | `https://grok-experience-navigator.netlify.app/` |
| Nocturne Hotel / Poe Concierge | `https://nocturne-ai-hotel.netlify.app/` |
| Y22 Roleplay | `https://y22-ai-sales-roleplay.netlify.app/` |
| Enterprise Voice AI Launch Console | `https://elevenlabs-forward-deployed-engineer.netlify.app/` |
| ForwardOps Voice Pilot Command Center | `https://vapi-pilot-command-center.netlify.app/` |
| Agentic Marketing Operations Workbench | `https://gp-agentic-revenue-ops.netlify.app/` |
| Flux Atlas | `https://flux-atlas-demo.netlify.app/` |

## Local Visual Evidence

- Design concept: `docs/evidence/design-concept.png` (`864x1821`).
- Local desktop full-page screenshot: `docs/evidence/local-desktop-fullpage.png` (`1536px` viewport).
- Local mobile full-page screenshot: `docs/evidence/local-mobile-fullpage.png` (`390px` viewport).
- Concept-width local screenshot: `docs/evidence/local-concept-width-fullpage.png` (`864px` viewport).

## Fidelity Ledger

| Comparison Point | Concept Evidence | Render Evidence | Result |
|---|---|---|---|
| First viewport identity | Large `Shanto Mathew` hero with direct positioning | Render keeps name dominant, positioning directly underneath, and two primary actions | Pass |
| Visual system | Light security/automation command-map imagery with teal accents | Generated command-map hero asset is integrated with teal/emerald accents and restrained amber | Pass |
| Section order | Hero, achievements, skills, demos, approach, contact | Same order, with public-safe data policy added under approach | Pass |
| Demo gallery | Card grid with live demo CTAs | Actual Netlify-hosted demo cards, filters, live links, and source link where known | Pass |
| Sensitive data handling | Concept avoided phone/private data | Render excludes phone, full address, DOB, rates, recruiter details, and identity docs | Pass |
| Mobile layout | Responsive-friendly section rhythm required | Mobile screenshot shows single-column layout with no horizontal overflow | Pass |
