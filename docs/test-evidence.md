# Test Evidence

Last updated: 2026-05-20 local verification pass.

| Requirement | Status | Evidence | Notes |
|---|---|---|---|
| Local lint/type/test/build | Pass | `npm run verify` | Lint, typecheck, 3 unit tests, and production build passed. |
| Local browser/Playwright desktop and mobile | Pass | `npm run e2e` | 2 Playwright tests passed across desktop and mobile; clicked demo filter controls, live-link controls, contact workflow, and checked overflow/target sizes. |
| Netlify production `/` | Pending | `curl -fsSIL` and browser | Must verify deployed URL, not just localhost. |
| Netlify production `/api/health` | Pending | `curl -fsS` | Confirms backend function. |
| Contact backend `/api/contact` | Pending | API POST and browser form | Netlify Forms capture verified after deploy. |
| Real Chrome profile final pass | Pending | Manual pass | Click every visible primary control. |
| Desktop and mobile layouts | Pending | Playwright and real Chrome | Check no overflow/overlap. |
| Console and network errors | Pending | Playwright/Chrome | Must be clean or documented. |
| Security headers and CSP | Pending | `curl -I` | Confirm production headers. |
| Production npm audit | Pending | `npm audit --production` | Report findings. |
| GitHub public source | Pending | GitHub repo URL | Push standalone app folder only. |
| Custom domain `ShantoMathew.com` | Pending | Netlify domain/DNS check | Requires IONOS DNS update. |

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
