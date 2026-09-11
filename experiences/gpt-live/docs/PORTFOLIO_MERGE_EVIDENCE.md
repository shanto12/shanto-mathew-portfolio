# Merged portfolio preview release evidence

Verified September 11, 2026, approximately 4:29–4:36 PM Central Time.

- Preview: https://shanto-portfolio-live.netlify.app/
- Source commit: `d266c38` (design merge `d6dfbc8`, followed by the accessibility announcement correction).
- Published Netlify deploy: `6aa473d7c5c59ac1e5dc1dbd`, ready.
- Custom domain: https://shantomathew.com/ — unchanged, awaiting explicit approval before replacement.
- Preserved original: https://shanto-fieldwork-portfolio.netlify.app/ and immutable deploy `6aa1d197f09280f08595e246`.

| Requirement | Evidence | Result / actual scope |
|---|---|---|
| Use the actual current portfolio design | [Source proof](evidence/portfolio-merge/original-source-proof.json) | Original HTML, JS and CSS matched live custom-domain assets byte-for-byte before the merge. |
| Remove excessive first-screen whitespace | [Layout measurements](evidence/portfolio-merge/layout-check.json), production screenshots | Work begins about 764px down at 1440px desktop and 584px at 390px mobile. Portrait and positioning remain visible; tested 320/390/768/1440 without horizontal overflow. |
| Preserve14projects, detailed cases, images, navigation and mobile workflows | [Final production matrix](evidence/portfolio-merge/final-production/EVIDENCE_MATRIX.md) | 17/17 grouped tests; all 14 gallery/case routes and image inspection, previous/next, keyboard, mobile picker, filters, Undo and native links covered. |
| Retain Pip controls and page awareness | Same17-group suite | 20 allowed navigation/highlight targets; themes, density, visible hero rewrite/reset, Undo, expressions/effects and coarse ID-only context passed. Provider/RTC responses were simulated and every POST intercepted. |
| Permission, autoplay and stale microphone recovery | [Recovery matrix](evidence/portfolio-merge/RECOVERY_MATRIX.md) | 7/7 on initial merged deploy. Runtime/bridge/CSS relevant to recovery unchanged in final one-line announcement fix; served hashes verified. |
| Real user Chrome | [Manual report](evidence/portfolio-merge/real-chrome.md) |Selected homepage/filter/case/image/Undo workflows; final announcement regression rechecked. Microphone setup canceled before admission. Comprehensive coverage and mobile are automated. |
| Backend checks and production dependencies | Local `npm run verify`, `npm audit --omit=dev` | 39/39 policy/budget/watchdog tests; build, typecheck and all three client-script syntax checks passed; zero production dependency vulnerabilities. |
| Actual published source, HTTP, CSP and security headers | [Final readback](evidence/portfolio-merge/final-production-readback.json) |All six served HTML/JS/CSS assets match source; expected CSP, microphone policy, HSTS, referrer, nosniff and frame restrictions. |
| Browser/first-party resource errors | Final production suite |None recorded. |
| Preserve current custom domain and old Netlify version | [Before](evidence/portfolio-merge/original-preservation-before.json), final readback |Both originals remain HTTP 200 with unchanged identical HTML hash. No domain/DNS or original-project mutation. |
| Spending and real speech scope | Final health readback |Voice available, no additional admissions from this task; remaining portfolio application allowance approximately $0.58. The $10 combined authorization is unchanged. No new live spoken-action test was run for this design release; prior speech evidence is historical, while current page integration tests are mocked. |
| Auth, payments, password manager, submission forms, provisioning and external demo execution | Portfolio source and scope |Not implemented portfolio workflows. External links tested as navigation targets only; no external backend claims. |

The original M/Pip voice personality, generated speech guidance, watchdog and admission implementation were retained. New project/career context contains fourteen trusted project entries and the owner-confirmed CDW end date of May 2026. This preview is ready for visual review within the stated coverage; it is not an unrestricted voice release or enterprise certification. Custom-domain publication and a larger voice allowance require their respective user approvals.
