# Atmosphere review release evidence

September 11, 2026, Central Time. Separate review URL: https://shanto-portfolio-atmosphere.netlify.app/

Final deployment: `6aa4957de275bbaec8c7c780`. No custom domain is assigned to this review project.

| Requirement | Evidence method | Result and scope |
|---|---|---|
| Final deployment, functions and origin configuration | Netlify deploy API, health, actual API calls | Ready; review URL only, server credentials configured |
| Build and backend tests | TypeScript / node / 60 automated tests | 60 passed; fresh ledger, concurrency, limits, origin checks, planner allowlist and watchdog |
| Production dependency security | npm audit --omit=dev | Zero vulnerabilities |
| All website primary workflows | Deployed Playwright | 17 groups passed: all14 case studies and previews, filters, image zoom/fit/close, navigation, career, session appearance, keyboard, mobile picker/menu |
| Real Chrome profile | Native CUA | Native permission prompt and Allow this time; all14 previews, five filters, main navigation, Flux Atlas case/image flow, motion/reset, visual inspection |
| Voice in real Chrome profile | Native CUA + budget record | Permission flow and conservative budget refusal verified. Actual live audio was tested separately in isolated Chrome, not human microphone |
| All eight scenes | Deployed browser scene API, desktop/mobile screenshots | 18 groups passed; <=110 particles, no overflow, pointer pass-through, constellation links, Escape, 45-second cleanup |
| Motion and lifecycle safeguards | Deployed browser and mocked timers | Reduced motion, pause/resume, hidden tabs, reset, end, bounded frame/particle work passed |
| Startup, permission, autoplay and reconnect | Deployed scripts with mocked browser media/provider | 33 checks passed, including refresh startup, permission-change retry, denial, 429, stale media, recovery and local clear |
| Initial audible greeting | Real provider WebRTC, default Chrome autoplay policy, pre-granted synthetic microphone | Zero page clicks; final first audible sample at5.350 seconds after navigation; earlier runs5.837 and10.720 seconds. No zero-latency claim |
| Voice-controlled rain/snow/wind/pond/aurora/constellation | Real synthetic speech → deployed planner → browser | Six commands passed in first call; actual non-silent output recorded |
| Voice-controlled spotlight/surprise | Real synthetic speech → deployed planner → browser | Named AgentProof spotlight and random surprise passed in follow-up |
| Interrupting narration to clear effects | Real synthetic speech on final deploy | Rain then “Clear all the effects” passed; scene became null with zero particles and conversation remained connected |
| Real mute/unmute and shutdown | Actual WebRTC tracks + provider event + server records | Final call passed; all three test calls closed with provider-confirmed usage, no live test session retained |
| Inactivity and maximum time | Deployed client with mocked timers + backend watchdog tests |180-second visitor inactivity and600-second cap passed; self speech never resets inactivity. Full10-minute silence was not purchased for testing |
| No runtime/network/CSP regressions | Final deployed Playwright console, network, headers | No runtime or first-party failures; strict CSP, HSTS, nosniff, frame denial, permission policy and no-store API verified |
| Unauthenticated endpoints and secret-file boundaries | Real HTTPS requests | Wrong-method405, foreign-origin403, invalid-token guide/end400, private env/source paths404; no paid admission |
| Source identity | Deployed JS/CSS SHA256 comparison | Seven assets exactly match final local source; index metadata points at the review URL |
| Original portfolio and backup unchanged | Before/after HTTP SHA256 + Netlify domain/deploy API | All five fingerprints match; original domain deploy6aa48294fa3641527184f0bc and backup6aa1d197f09280f08595e246 unchanged |
| Spending authorization | Parent earmark receipt + review ledger | $3.75 inside existing AgentMart envelope, not additional to $30; no ledger reset |
| Auth, purchases, password manager, task runners | Source/workflow inspection | No login/payment/backend job workflow exists in this portfolio. Voice API and independent watchdog are the applicable backend flows |

## Findings resolved during release

The initial “spotlight a project” request asked which project. The named AgentProof request then passed; this was a conversational clarification, not an unexecuted claim of success. An initial clear request during narration was transcribed but not delegated; final code recognizes explicit positive visual-clear requests locally, rejects negation/incomplete commands and blocks stale visual actions. The final paid clear test passes.

Netlify's injected public badge caused CSP console errors. Disabled the badge for this review site without weakening CSP; the full final deployed site suite passed cleanly. One early busy-audio mock fixture race was corrected; the final33-test engagement run passed without retries. Raw initial voice results remain alongside final evidence.

All eight scene rendering functions and backend actions are byte-identical between the first scene/voice verification and the final deploy. The final change added deterministic local clearing and corrected review metadata; final33 engagement checks include all eight scene dispatches.

## Billing interpretation

Three actual voice calls reported73,38 and26 seconds, totaling137 seconds. At the configured $0.05/minute rate, recorded voice usage is approximately $0.1142. This is voice-only usage, not a complete invoice: planner requests are accounted conservatively and provider billing remains authoritative. Each reservation includes a $0.60 planner hold, even for unused requests. Parent earmarks are allocation transfers, not API usage.

Final admission availability and settled accounting are recorded in `budget-final.jsonl` and `health-final.json`. Final health confirms voiceAvailable=true, no blocking connection and $1.835832 remaining in the review suballocation. All three test sessions have confirmed closure and final usage. The raw ledger in budget-final.jsonl retains pre-reconciliation holds; its accounting object and health-final.json show the current reconciled admission allowance.

Draft review PR: https://github.com/shanto12/shanto-mathew-portfolio/pull/2 . The review branch is not merged and the custom-domain deploy was not updated.
