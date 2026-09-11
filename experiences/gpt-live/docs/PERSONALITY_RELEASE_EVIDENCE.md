# Personality and awareness release evidence

> Historical evidence. See [speech recovery](SPEECH_RECOVERY.md) and [natural conversation release](NATURAL_CONVERSATION_EVIDENCE.md) for the current deployment and voice availability.

Verified September 11, 2026, approximately 11:23–11:31 AM Central Time. This is a separately deployed preview with bounded voice access. It is not an unrestricted or fully enterprise-certified service.

| Site | Production URL | Deployed source commit | Netlify production deploy |
|---|---|---|---|
| AgentMart | https://agentmart-live-shanto.netlify.app | `8cfc195` | `6aa42b70f0b74e47aa8b75ec` |
| Portfolio | https://shanto-portfolio-live.netlify.app | `99e0651` | `6aa42b71aebd834142d67309` |

The subsequent documentation/evidence commit does not change served runtime assets or functions. Published `voice.js` SHA-256 is `4dd4171466a20fcc21c093ffdaaa2f517d6bec4a6bb951298da0d6ca83986bec` on both sites. Asset readback matches the local voice runtime, styles, site bridges and app scripts. Netlify's inert hosting metadata accounts for the observed HTML-only difference; no additional executable script was injected.

## Requirement matrix

| Requirement | Evidence method | Result and limits |
|---|---|---|
| Actual Netlify production release | Netlify deploy reader + public asset GET | Both ready/published; identifiers above, [assets and headers](evidence/personality/production-assets.json) |
| Existing visible controls, catalog/projects, forms, tabs and workflows | Production Playwright, 33 checks | Pass. Includes all 12 sample products, 9 projects, career details, demo forms, compare/saved/filter/layout/reset controls. [GUI matrix](evidence/personality/GUI_EVIDENCE_MATRIX.md) |
| Open item, viewport items, recent native actions | Production Playwright, 32 awareness/personality checks | Pass; both bridges produce bounded context. [Awareness matrix](evidence/personality/AWARENESS_EVIDENCE_MATRIX.md) |
| Private form/search/DOM exclusion and bounded context | Production Playwright + server policy tests | Pass; raw state is empty, only catalog IDs/coarse actions go in awareness. Spoken user input still goes to the provider. |
| Model navigation does not imitate visitor activity | Production Playwright | Pass; no self-triggering suggestion loop. |
| Delivery expressions and serious/playful preferences | Production Playwright + policy tests | Seven enums, expiry, opposite-order preference changes and action bypass prevention pass. Model audio remains generative. |
| Limited, tentative proactive suggestions | Production Playwright with virtual clock | Dwell/debounce, 25-second interval, shared two-attempt cap, typing/speech/mute/End/stale-response behavior pass. No real-provider proactive-sales-quality claim. |
| Actual provider identifies a product without visitor naming it | Real deployed API/WebRTC in isolated Chrome with synthetic microphone | AgentMart pass: native Parallel opening, visitor asked about the product just opened; real planner returned Parallel facts and spoken output identified Parallel. [Live matrix](evidence/personality/AGENTMART_LIVE_EVIDENCE_MATRIX.md) |
| Actual emotional voice and avatar integration | Same AgentMart provider call | Real response chose angry/mock_grumpy; client rendered mock_grumpy; spoken output included “heh-heh, hmph.” This is one observed delivery, not proof of every subjective emotion or unrestricted conversation quality. |
| Voice mute/unmute and shutdown | Actual provider call + authenticated backend ledger | AgentMart pass: real outgoing tracks toggle, provider `session.closed`, peer closed and tracks ended. Latest call finalized at 18 provider seconds. |
| Portfolio provider conversation on this revision | Not repeated | **Blocked by exhausted trial admissions.** Deterministic GUI/runtime are tested; earlier-release provider evidence is historical only. |
| Real user's Chrome profile | Selected manual pass on both published sites | Product/project details, save/unsave, category filter, experience expansion and compact avatar inspected. [Exact manual scope](evidence/personality/real-chrome.md). Full control matrix was automated, not entirely repeated in real Chrome. |
| Desktop/mobile, reduced motion and browser errors | Production Playwright + screenshot review | Pass across tested 320/390/768/1440 widths; zero console/page/network/HTTP errors in the GUI suite; zero awareness browser errors/unknown mutations. |
| CSP and security headers; health endpoint | Public headers/API | Present and health 200/configured on both; [readback](evidence/personality/production-assets.json). Configured does not mean voice admission remains available. |
| Build, policy/watchdog checks and production dependency audit | Local app commands | Typecheck/syntax pass, 27 tests per app pass, `npm audit --omit=dev` reports zero known vulnerabilities. |
| Credentials excluded from public artifacts | File-pattern scan + source/publish review | No secret-pattern matches; [scan](evidence/personality/secret-scan.json). Pattern scanning is not a comprehensive security certification. |
| Auth/login/logout/password-manager/payment/provisioning | Scope review | No such live integrations were added. AgentMart remains an illustrative concept; local demo forms are not backend commerce. |
| Three-minute inactivity and cost control | Mock clock + unchanged watchdog tests/current ledger | 180-second visitor inactivity implemented; stricter 110-browser/120-server trial ceilings take precedence. No full three-minute real paid call was attempted. |

## Current allowance and limitations

[Authenticated ledger snapshot](evidence/personality/budget.jsonl): both sites have used all **eight lifetime trial admissions**; zero remain. Each reserves $4 of the release envelope, $8 combined, within the original $10 authorization including development headroom. There was no increase, reset, refund or new budget ledger during this extension. New voice admissions now return the configured usage-allowance message.

Confirmed release voice usage totals approximately **$0.67**, plus historical confirmed development voice of $0.215. These are **known voice estimates only**, not the full provider bill: text-model charges and two provider-unavailable sessions are not fully reconciled, and full reservations remain held for unknown usage. Exhausting the conservative session allowance does not establish that $10 was billed. Additional calls require an approved replenishment policy; do not silently delete or rename the ledger.

No claim is made that the AI sees eye gaze, private fields, another tab or external browsing history. Intent is a task-related hypothesis. The guide is prompted to sell through factual relevance and respect refusal; arbitrary sales effectiveness, subjective emotional realism and hiring outcomes are not certified by these tests.

## Reproduce the no-cost integration checks

With Chrome and an existing Playwright installation, run `AGENTMART_BASE=https://agentmart-live-shanto.netlify.app PORTFOLIO_BASE=https://shanto-portfolio-live.netlify.app PLAYWRIGHT_MODULE=/path/to/playwright node scripts/verify-awareness.mjs` from this app. Every mutating API call and media connection is mocked by this script. The AgentMart-only `scripts/verify-live-awareness.mjs` is explicitly paid, one-shot, and must not be run without an available approved trial admission. Reports and screenshots are local; no test artifact is published in `public/`.
