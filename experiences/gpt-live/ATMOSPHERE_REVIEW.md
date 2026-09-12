# Portfolio atmosphere review

Separate owner-review deployment: https://shanto-portfolio-atmosphere.netlify.app/

Branch: `codex/portfolio-atmosphere-review`, copied from approved live source `de975c6`. Site ID: `025c3e75-39a9-4f35-bc44-6b2dfa47856f`. The custom-domain deployment and backup remain separate.

## Visitor experience

Pip attempts a new generated greeting on every load and refresh, requests microphone permission on startup, and resumes automatically after a permission grant when supported. Browser permission and autoplay policies still apply. The avatar is the only dedicated visible voice control: select it to mute/unmute or reconnect; Escape ends the session. No new avatar buttons were added.

Permission help uses bounded free visual guidance while no paid call exists. During a connected quiet session, Pip may improvise three invitations at 20, 50 and 90 seconds. Visitor activity alone resets the three-minute inactivity clock; Pip's own speech does not. The server caps calls at ten minutes. Quiet, mute, hidden-tab and end states suppress continued invitations. There is no promise of zero network/model startup latency.

Ask Pip to:

- “Make it rain.” Rain streaks and small splashes.
- “Make it snow.” Drifting snow and a light coating on page edges.
- “Make it windy.” Leaves and wind trails.
- “Turn this into a pond.” A shallow water layer, fish and pointer/touch ripples.
- “Show the northern lights.” Aurora bands and stars.
- “Show your skills constellation.” Six factual, keyboard-accessible skill links connected to relevant portfolio sections.
- “Open AgentProof and spotlight it.” Navigation plus a visual focus frame.
- “Surprise me with a scene.” A local random selection from the seven scenes.
- “Clear all the effects.” Restore the unadorned page while keeping the conversation active.

## Architecture and boundaries

`scenes.js` exposes a fixed synchronous `play/clear/getState` interface, rendered with Canvas and a small accessible constellation navigation element. The backend planner returns allowlisted action names, never executable code. Effect results are sent back to Pip; observations are marked as untrusted context. Effects are temporary browser state, with no saved changes to the portfolio.

Only one scene runs at a time; it clears after 45 seconds, on hidden tabs, Escape, reset or conversation end. Particles are bounded (110 maximum desktop), mobile uses fewer particles, canvas resolution is capped, and drawing is throttled. Reduced-motion and the existing Pause motion setting use still scenes. Overlays do not intercept portfolio clicks. The animated constellation links remain keyboard accessible.

## Cost allocation

The owner's total authorization remains $30: $14 AgentMart, $14 original portfolio, $2 development hold. This review has a $3.75 **suballocation inside AgentMart's existing $14**, backed by three $1.25 earmarks in the parent ledger (slots 14–16). Those earmarks contain no provider session and are not API charges. The review uses its own `live-budget-atmosphere-review-v1` store, with fresh accounting permitted only when no existing records are present. Never reset either ledger to recover allowance.

Each new session reserves $1.25, including a conservative $0.60 planner hold for up to 30 requests. Reservations are not invoices. Settlement waits until the authoritative session deadline plus the accounting grace period, even after an early end. Health reports the remaining admission allowance, which can temporarily be less than the eventual available allowance. Effects themselves run locally without API generation charges.

The OpenAI credential is server-side in Netlify environment variables. No key is included in browser assets or this document. A fresh watchdog credential and an origin restricted to the review URL isolate the new deployment.

## Release evidence

See `review-evidence/EVIDENCE_MATRIX.md` for current deployed checks, explicit automation versus real Chrome boundaries, measured startup, budget closure, and original-site preservation. The evidence includes initial failed checks and their explanations; a successful build alone is not release verification.

Netlify's injected public badge caused CSP console errors. It was disabled for this review project using its per-project setting; the strict script policy was preserved. Official reference: https://docs.netlify.com/manage/projects/powered-by-netlify-badge/
