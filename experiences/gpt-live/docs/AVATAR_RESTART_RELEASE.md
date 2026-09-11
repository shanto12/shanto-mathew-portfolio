# Ten-minute voice and avatar restart release

Verified September 11, 2026, approximately 4:52–5:03 PM Central Time.

## Published scope

Portfolio preview: https://shanto-portfolio-live.netlify.app/ — deploy `6aa47914e0de31e6c61ee7e1`, source `58278a2`.
AgentMart preview: https://agentmart-live-shanto.netlify.app/ — deploy `6aa47930c5c59aee8bdc1db9`, source `f95dee0`.

The existing avatar remains the only visible voice control. No HTML, CSS, display text, personality, project content or custom-domain settings changed. A failed `session.close` send previously could throw before the fallback was armed, leaving the avatar stuck in the ending state. Cleanup now detaches old connections before closing them, catches resource failures, ignores late startup events, and always allows an explicit retry after local shutdown. Normal End already supported restarting; the corrected defect was an exceptional shutdown path.

New sessions have a server deadline of 600 seconds from reservation creation. Startup consumes part of that window. The browser receives the actual remaining duration, and a 14-minute background watchdog independently closes at the server deadline. Three-minute visitor inactivity still ends the call. New sessions allow30 bounded backend requests; legacy sessions retain10. Each new admission reserves $1.25 ($0.50 voice, $0.60 backend request allowance, $0.15 margin). Historical charges, holds and session records are preserved. This is conservative application accounting, not an exact provider invoice or a provider-enforced billing guarantee under every failure.

## Funding remains pending

The user requested a longer allowance, but their earlier explicit dollar policy required approval before $20/$30. An async choice is pending; no answer was received. The current total authorization remains $10, split $4 per preview and $2 retained for development. Portfolio has approximately $0.322495 remaining and AgentMart $0.937497; neither covers the new $1.25 admission. Therefore **voice is not currently unblocked**. Clicking the avatar retries but correctly cannot bypass the approved budget. No paid calls were made in this turn.

After explicit approval, both deployments must receive the same allocation map:
- `LIVE_TOTAL_APPROVED_USD`: approved10/20/30 tier.
- `LIVE_AGENTMART_BUDGET_USD` and `LIVE_PORTFOLIO_BUDGET_USD`: allocations whose sum does not exceed total minus the fixed$2 development hold.
- Suggested $20 configuration: total20, AgentMart9, portfolio9. Suggested $30 configuration: total30, AgentMart14, portfolio14. These are proposals, not applied settings.

Never reset usage ledgers to grant more access. Rebuild/deploy after setting approved environment variables and verify health and real speech within the allowance.

## Evidence matrix

| Requirement | Evidence | Result and limits |
|---|---|---|
| Avatar-only interface unchanged | Git source diff; published JS/CSS hash readback; real Chrome | Only public/voice.js changed; no new visible controls or wording. |
| Expiry, normalEnd, denied mic, allowance rejection, autoplay, throwing shutdown/cleanup, missing close acknowledgement, provider expiry, failed connection, stale media and inactivity recovery | final-production-recovery/verification.json |32/32 on final public URLs; synthetic microphone/RTC, all POSTs intercepted. |
| Actual server lifecycle and ten-minute cutoff without browser | backend test logs |48/48 per app; VM fake provider/clock/storage, including full600-second watchdog, API deadline/setup latency, legacy/new permits, CAS accounting and invalid allocation rejection. Not a real ten-minute paid call. |
| Existing portfolio workflows, cases, filters, image inspection and mobile | portfolio-workflows/verification.json |17/17 on final public URL. |
| Existing AgentMart catalog, categories, search, sorting, saves, comparison, demo acquisition and mobile | agentmart-workflows/verification.json |18/18 on final public URL; commerce remains demonstration only. |
| Real user Chrome | Native Chrome CUA after final deployment |Both preview URLs reloaded/opened; existing avatar clicked; observed Connecting then returned to enabled avatar and budget message. No paid admission or live speech; comprehensive controls/mobile were tested in automation, not manually. Temporary review tabs closed. |
| Deployment/source/headers | readback.json |Both health endpoints report600seconds; all JS/CSS exact source hashes. HTML matches after removing only Netlify's injected hosting attribution comment and two meta tags. CSP/mic policy/HSTS/frame/nosniff/referrer recorded. |
| Original portfolio | readback.json |shantomathew.com unchanged exact HTML; original Netlify copy unchanged after the same hosting-metadata normalization. No DNS/domain/original-deploy mutation. |
| Dependency audit | npm-audit.json |Zero production vulnerabilities; both apps share the same dependency lockfile. |
| Budget/history | budget-before.jsonl, budget-after.jsonl |Portfolio14 and AgentMart12 admissions unchanged; total10 unchanged; both currently block new admissions. |
| Paid speech, ten actual elapsed minutes, user microphone quality | Not exercised |Pending funding approval. Do not label this release an end-to-end live-speech verification. |
| Auth/login/password manager/payments/runner jobs | Scope inspection |Not implemented production workflows in these portfolio/marketplace previews. No real transaction/provisioning claim. |

Official pricing checked: https://developers.openai.com/api/docs/models/gpt-live-1 ($0.05/minute, backend separate) and https://developers.openai.com/api/docs/models/gpt-5.6-luna ($0.20/M input,$1.20/M output). The existing64KB payload and400-token output cap support the conservative$0.02 per backend-request reservation.
