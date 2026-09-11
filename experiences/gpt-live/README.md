# Shanto Portfolio Live

**Current preview:** [Fieldwork design + Pip merge](docs/PORTFOLIO_MERGE_EVIDENCE.md). Fourteen projects, compact opening, original personality. Custom-domain switch awaits approval.
**Current update:** [Speech recovery and budget accounting](docs/SPEECH_RECOVERY.md) supersedes the earlier eight-session trial counter and hidden error behavior. The spending authorization remains $10 total.

New separate URL: [https://shanto-portfolio-live.netlify.app](https://shanto-portfolio-live.netlify.app). Branch: `codex/gpt-live-experience`.

The guide uses the supplied portfolio facts and section IDs; it must not invent career claims, credentials, client outcomes or availability.

## Design and architecture decision

This is a separately deployed experience on branch `codex/gpt-live-experience`, imported from the approved existing site. The static import is a deliberate exception for this experiment; it does not replace the original application's architecture or production URL. Build from this `experiences/gpt-live` directory using its own `netlify.toml`; publish only `public/`.

The latest requested presentation is **avatar only**: a small floating speaking avatar, approximately 100px on desktop and 76px on mobile, mounted through an empty `#live-guide-mount`. AgentMart gives its listings/search/filter controls the main visual focus. There is no default avatar heading, description, control row, conversation panel or visible typing interface. Click the avatar to mute/unmute an active session, reconnect when disconnected, or enable sound when playback was blocked. Escape ends the conversation. Accessible control names/status remain available without adding a visible chat window.

The shaded CSS face reacts to actual remote-audio RMS through `AudioContext`; this is audio-reactive animation, not phoneme-level lip synchronization. The earlier large inline presenter is a historical iteration, not the intended current architecture. Final compact production GUI evidence is recorded; selected real Chrome checks and their scope are described in the release matrix.

Microphone permission is requested immediately over HTTPS. The browser still owns permission and autoplay rules; clicking the avatar supplies a playback/reconnect gesture when needed. If microphone access is denied, normal website controls remain usable; there is no visible typed-chat fallback in this avatar-only presentation. Emotions are visual/conversational performance, not claims that an AI has feelings.

## Runtime flow and permissions

1. `app.js` and `site-guide.js` initialize the site; `voice.js` mounts the small avatar. `/api/live` checks origin/configuration, atomically claims a finite admission permit and creates a `gpt-live-1` WebRTC session using client delegation and the `gleam` voice.
2. A server watchdog attaches through an authenticated sideband. The browser receives SDP only after the trusted watchdog record reports readiness; a background-function HTTP response alone is not readiness proof.
3. Spoken delegated requests use `/api/guide`. The existing `/api/chat` path remains an internal/backward-compatible bounded API route, but a typing interface is not exposed in the requested compact presentation. The **Responses API with `gpt-5.6-luna`** receives trusted site facts and bounded visitor input/history/state. Each response has `max_output_tokens: 400` and at most four proposed actions, validated on the server before application.
4. The browser's allowlisted bridge navigates sections, filters, highlights, changes theme/density/expression, rewrites the hero as plain text, or resets. The runtime also accepts exactly five temporary effects: `confetti`, `sparkles`, `bounce`, `spotlight`, and `clear`. Effect values are allowlisted on the server and runtime, with bounded duration/particle counts, cleanup, and reduced-motion alternatives. Effects never execute arbitrary model-supplied styling or code. It reports actual application results back to the voice session. Changes use tab-scoped `sessionStorage`; undo/reset are available. No model-generated HTML or JavaScript runs.
5. **Escape/End mutes outgoing input immediately**, requests provider closure, and waits for `session.closed` before cleanup, with a five-second local fallback labeled Disconnected. The server watchdog remains responsible for the 120-second reservation deadline. Local cleanup is not provider billing-finalization proof.

The Agents API is intentionally not used: the evaluated integration did not provide the explicit hard per-turn output-token control required for this small experiment. The bounded Responses planner supplies that control. There is no autonomous source editing, deployment, outbound messaging, account authentication, payment, provisioning or commercial backend integration. The guide may only change this visitor's interface.

## Portfolio career advocate

The release candidate includes server-only career-advocate instructions in both voice and planner prompts. The AI should help recruiters and engineering leaders assess Shanto for senior, well-compensated AI/FDE work: ask naturally about their role/problem, connect two relevant verified skills or career examples, show relevant Work/Experience sections, and offer Contact when there is interest. Its tone is confident, funny, witty, natural and lightly cheeky while remaining professional; technical questions receive serious, evidence-backed answers.

The advocate uses supplied resume/site-context facts. It must identify itself as AI, never invent metrics, credentials, compensation, offers, availability or hiring outcomes, and never negotiate commitments or set a salary floor. Compensation discussion belongs directly with Shanto. Source implementation is present; the compact deployment is recorded; the actual retry passed and a delegated career answer began, mentioning strong Python experience before End. This is not a complete qualitative pitch evaluation.

## Inactivity, invitations and persona

The requested browser behavior adds a **180-second visitor-inactivity timer**, reset by visitor activity rather than the AI's own output. It does not extend the paid session: the unchanged 110-second browser trial timer and 120-second server reservation deadline currently end a connected trial sooner. A full three-minute connected idle period therefore cannot be reached under this initial budget policy.

During a connected conversation, the guide may offer at most two short, playful invitations at 20 and 50 seconds of visitor inactivity. While microphone permission is still pending, the browser may attempt one local text-to-speech invitation after 18 seconds, only if autoplay permits. That local invitation makes no provider API request, must never run after permission denial, and is canceled when permission resolves or the session ends. Browser speech availability/playback is not guaranteed.

M is AgentMart's market scout; Pip is the portfolio's career wingman. Both should be natural, funny and playfully mischievous while remaining professional. An occasional “hmm” or “ta-da” can fit the conversation; repetitive filler, noises or pressure do not. Pip's greeting and career pitch follow the verified-fact boundaries above.

These lifecycle/persona changes describe the current source requirement/candidate. The [shared runtime mocked verification](docs/evidence/avatar-idle-mock-verification.json) records 32 passing avatar/control/effect/timer checks at 10:55:27 AM Central using isolated Chrome and a virtual clock, with no paid calls. This is local mocked evidence; actual three-minute inactivity is not claimed because shorter paid-trial limits remain in force. The financial limits below remain unchanged.

## Initial $10 authorization

| Boundary | Current configuration |
|---|---|
| Release store | `live-budget-release-v1`, immutable permits |
| Release permits | **$4 per site, reconciled against confirmed usage**, shared by voice and typed visits |
| Application reservation | $0.50 reserved before each admission; **$4/site**, $8 across both |
| Development headroom | $2 within the original $10 authorization |
| Session deadline | 120 seconds from server reservation; browser requests End after 110 seconds connected |
| Planner allowance | 10 requests/session × 400 maximum output tokens/request |
| Actions per planner response | Up to 4, with trusted targets and explicit value limits |

Failed or unconfirmed starts retain their full reservations. Confirmed closed voice sessions settle after the deadline plus a 30-second grace period, retaining $0.20 for all ten possible planner calls. Atomic accounting reuses only unused reserved funds inside the same $4 envelope; no budget reset or automatic top-up occurs. A separate 100-record safety ceiling bounds history; it is not a grant of 100 paid sessions.

There was one deliberate transition from the initial development ledger `live-budget-v1` to the release-only ledger within the original $10 authorization. The old ledger is retained as archived/read-only evidence, not erased or reused. The recorded development accounting is $0.215 confirmed voice cost, a full $0.50 reservation for one unconfirmed session, and a conservative bound below $0.36 for all 90 possible planner requests. Together this is below $1.075 and within the $2 development headroom; it is not an assertion that every reserved amount was billed. See [development accounting](docs/evidence/development-budget.json).

**Application envelopes are not an OpenAI administrative hard cap or a provider-guaranteed maximum bill.** An accepted create request whose response is lost, provider/network outages, changed prices or unconfirmed closure can defeat an exact billing guarantee. Actual provider usage must be reconciled. Known sessions with overdue unconfirmed closure block further admission. An authenticated provider 404 explicitly identifying `session_id_not_found` is recorded as provider-unavailable metadata; it does not invent a close receipt or refund the full reservation. Do not rename/delete the release ledger to regain permits. Increases to $20 and then $30 require owner approval; the requested notification beyond $30 is not an automatically configured notification service.

## Configuration and data boundary

Required Netlify configuration names: `OPENAI_API_KEY`, `WATCHDOG_SECRET`, `SITE_ORIGIN`. No values belong in source, public files, screenshots or logs. The current Netlify plan does not support function-only scopes or secret-marked environment configuration: these values are available in all supported scopes, while this code reads them only in functions via `Netlify.env.get`. There is no browser environment substitution. This is a code/publish boundary, not a claim of stronger platform scoping.

Only `public/` is statically published; functions, tests, context JSON and package files stay outside it. CSP, security headers and `microphone=(self)` are configured in the local Netlify file and must be verified on the served revision. Root repository configurations use different build outputs and may disable microphones.

Audio is sent to OpenAI while connected; bounded text/history/page state is sent for planning. Requests set `store: false`, which is not a blanket guarantee about provider abuse-monitoring retention. The app does not intentionally persist raw audio/transcripts in Blobs; its ledger holds session metadata, permits and hashed capability tokens. Any internal transcript state is held in browser memory; the compact presentation exposes no transcript window.

From this directory: `npm ci`, `npm run verify`, then `npm audit --omit=dev`. Static/mocked UI checks require no provider charges. Common runtime copies originate in the coordinating workspace's `shared/` directory and must stay synchronized across both apps.

## Release evidence

Compact Netlify deployment: `6aa42410875c3a05d4f75ebc`. Served voice.js matches canonical SHA-256 `1231985bc345b6bf61ba87254b6991ddc5667ac5dd47189ec4c772890ecb2952`. Commit is recorded by the coordinating source-control closeout.

The [portable evidence bundle](docs/evidence/README.md) records 20 policy/unit checks per app, 32 shared mocked avatar/idle/effect checks, **33/33 final production-page GUI checks** with paid APIs mocked, and **15 actual voice/API checks**: AgentMart 7/7 at 10:55:38 AM and portfolio 8/8 at 10:59:16 AM. Portfolio's earlier local audio-generator timeout is preserved as a diagnosed test-fixture failure. The retry captured the start of a career-fit answer, not a full qualitative pitch evaluation.

Selected final AgentMart controls were tested in Shanto's real Chrome profile. Portfolio's final compact presentation and the complete website workflow/layout suite are automated-only; earlier real-profile portfolio voice evidence predates the compact UI. The [release matrix](docs/RELEASE_EVIDENCE.md) states these limits explicitly. No every-control manual or full enterprise-readiness claim is made.

The [final release ledger](docs/evidence/final-budget.json) shows AgentMart **2 permits remaining** and portfolio **1 remaining**. Confirmed voice cost is approximately **$0.688333 including development**, not the total API bill; planner costs and unknown-session reservations are separate. The initial $10 allocation remains unchanged, with no automatic reset or additional paid tests planned.

Deployed source commit: `af3bee4` on `codex/gpt-live-experience`. Final [local checks](docs/evidence/final-local-verification.json) and [credential-pattern scan](docs/evidence/final-secret-scan.json) are included as separate evidence. This is a verified limited trial within the documented coverage, not enterprise certification.

## Personality and browsing awareness extension

The guides now receive bounded in-site browsing context and support expressive delivery, professional/quiet preferences, and limited context-aware suggestions. See [architecture and behavior](docs/PERSONALITY_AWARENESS.md) and [current release evidence](docs/PERSONALITY_RELEASE_EVIDENCE.md). This extension does not increase the trial allowance.
