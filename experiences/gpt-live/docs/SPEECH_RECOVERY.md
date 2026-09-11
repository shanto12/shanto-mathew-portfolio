# Speech recovery fix

The September 11 production check reproduced HTTP 429 on both `/api/live` endpoints while health incorrectly looked usable (`configured:true`). Eight lifetime trial admissions had been consumed. The avatar-only interface clipped the error text to screen-reader-only dimensions, leaving a sighted visitor with no explanation.

The recovery change adds a small temporary hint only when microphone permission, audio playback or a connection problem needs attention. The avatar remains the only voice control; connected and intentionally ended states remain avatar-only. Stale microphone permission, playback and connection callbacks are guarded so an older attempt cannot overwrite or stop a newer microphone stream. Canceling connection setup prevents a later admission, and a failure after admission explicitly requests provider closure.

Budget correction is limited to the already authorized $10 total: two $4 release envelopes and an untouched $2 development hold. Existing session/request records and unresolved reservations are preserved. Confirmed provider usage can release the unused part of a $0.50 session reservation, while retaining a conservative $0.20 for all ten possible planner requests. Unknown sessions keep the full $0.50. Concurrent admissions must atomically reserve funds before any provider session is created. This fixes an overly restrictive session counter without increasing the spending authorization or deleting the budget history.

Reference pricing checked September 11, 2026: [GPT-Live 1](https://developers.openai.com/api/docs/models/gpt-live-1) lists $0.05/minute billed per second; [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna) lists $0.20/M input and $1.20/M output, with cache writes at 1.25 times the input rate. The implementation keeps 400 maximum output tokens, adds a 64 KiB serialized provider request cap and standard service tier, and conservatively reserves $0.02 for each of ten possible planner calls. Application accounting is an operational envelope, not a provider invoice or administrative billing hard cap.

## Speech recovery verification (September 11, 2026, 2:23–2:30 PM Central)

The initial recovery deploys were AgentMart `6aa4558881648b360c6c09bd` (source `b4fa849`) and portfolio `6aa4558ccfe137b224f65145` (source `60af23b`). Their runtime SHA-256 was `ad5b36e502ee6b8aa2fcbeeb67fc2d4654f1dbecc1c37c9a08ebe81e3584ff4e`. The later natural-conversation release below supersedes these assets.

| Requirement | Method and evidence | Result and scope |
|---|---|---|
| Restore admission without increasing authorization | [Netlify Blobs concurrent CAS proof](evidence/speech-recovery/budget-cas-proof.json) | Both sites passed; unique reservations, unknown holds retained, historical records unchanged. Isolated fixture keys; no paid sessions. |
| Visible failure recovery, UI workflows, mobile, awareness | [Production suite](evidence/speech-recovery/production-qa.json) | 79/79 deployed checks; all mutating API/RTC interactions mocked. |
| Real greeting, visitor speech, navigation, appearance, effects, cleanup | [First live pass](evidence/speech-recovery/live-first-pass.json), [portfolio recheck](evidence/speech-recovery/portfolio-live-recheck.json) | AgentMart 7/7, portfolio 8/8 on recheck. The first portfolio career-answer assertion exceeded its 12-second fixture wait while speech was already underway; a single recheck with 25-second wait passed. Actual OpenAI calls in isolated Chrome, synthetic microphone. |
| Real user Chrome | [Manual pass](evidence/speech-recovery/real-chrome.md) | AgentMart connection, avatar-only display, mute/unmute and confirmed End; portfolio real voice tested in isolated Chrome, not the user's profile during this pass. |
| Build, typechecking, policy and watchdog | Local verification | 36/36 tests per app; production dependency audit found zero vulnerabilities. |
| Deployed asset identity and headers | [Readback](evidence/speech-recovery/production-assets.json) | Expected assets; CSP, HSTS, permissions policy, referrer policy, nosniff and frame restrictions present. |
| Secret scan | [Scan](evidence/speech-recovery/secret-scan.json) | No credential patterns in checked served assets or function sources. |
| Availability and shutdown | [Budget/backend snapshot](evidence/speech-recovery/final-budget.jsonl) | Both voiceAvailable true; latest calls confirmed closed. Conservative available headroom at capture: AgentMart $1.099164, portfolio $0.994996, with recent full holds pending grace-period settlement. |

Application accounting includes conservative reservations and is not an invoice. Both sites retain the combined $10 authorization; no top-up or ledger reset occurred. The preview's 110-second browser / 120-second server call ceiling remains shorter than the requested three-minute idle cutoff. Authentication, payment and provisioning are not implemented workflows in these separate previews; original production sites are unaffected.

## Natural conversation follow-up

The agents retain their existing M and Pip personalities, but generate their own opening and early replies. Fixed greetings and the browser-synthesized permission monologue were removed. Before microphone permission, a small visual recovery hint explains the required browser action without starting another paid call. After connection, short invitations are generated by the model, and audio unlock resumes the current conversation rather than restarting a script.

Natural expression is selected from conversation context instead of being forced to thoughtful/warm for each suggestion. Invalid proactive replies are suppressed instead of replaced with canned questions; proactive actions remain blocked. The guide still respects quiet/serious requests, verified facts and the existing cost controls. Repetition remains possible in generative output; distinct wording on every visit is not guaranteed.

Final follow-up deployment and verification evidence is recorded in `NATURAL_CONVERSATION_EVIDENCE.md`.
