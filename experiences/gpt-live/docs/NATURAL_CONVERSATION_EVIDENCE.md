# Natural conversation release evidence

Verified September 11, 2026, approximately 2:37–2:41 PM Central Time.

| Site | Live URL | Source commit | Published Netlify deploy |
|---|---|---|---|
| AgentMart | https://agentmart-live-shanto.netlify.app | `a73dafc` | `6aa4582db05d02b7879629e7` |
| Portfolio | https://shanto-portfolio-live.netlify.app | `616229a` | `6aa4582cc9bb54ebee90fbd5` |

Both deploys were read back as ready and published. `voice.js` SHA-256: `e062175293f6e3dbb900511120d7018a6f7195e41058f8fb1d8371927fd0459e`. Later evidence-only commits do not alter served source.

M remains AgentMart's playful market scout; Pip remains Shanto's witty career advocate. The fixed greeting strings, explicit Say instruction, pre-permission browser-synthesized monologue and canned proactive fallback question are removed. The model chooses wording and conversational delivery from context. Gentle model-selected expressions are preserved for suggestions; dramatic expressions still follow visitor invitation and serious/quiet preferences. Before permission, the small visual microphone hint remains available without a paid call.

| Requirement | Method and evidence | Result / limitation |
|---|---|---|
| Natural opening guidance reaches Live | [Recovery fixture](evidence/natural-conversation/recovery-verification.json), shipped asset readback | Fresh-word instructions emitted through actual shipped code and acknowledgement flow; no `guide.greeting` reference or fixed greeting value. This tests guidance, not a guarantee every future greeting will differ. |
| Real voice and page actions on both sites | [Live suite](evidence/natural-conversation/live-verification.json) | 15/15 passed: automatic nonzero remote audio, synthetic speech transcription, rose theme, playful expression, navigation, confetti, mute/unmute, provider closure and stopped tracks. No mocked API responses. |
| Portfolio career explanation | Same real live suite | Spoken professional-fit response verified through real delegation; factual claims remain constrained to site evidence. |
| Real user Chrome | [Manual pass](evidence/natural-conversation/real-chrome.md) | Final AgentMart release connects, stays compact, mutes/unmutes and ends. This is selected manual coverage; comprehensive controls and final portfolio pass are isolated Chrome automation. |
| Catalog/project dialogs, tabs, primary controls, forms, session customization, mobile | [Production matrix](evidence/natural-conversation/production-MATRIX.md) | 33/33 with mocked voice/API; forms that intentionally explain preview scope checked. No live commerce, account authentication or provisioning exists in these separate previews. |
| Page awareness, quiet/serious preferences, bounded expressions, no proactive page mutations | [Awareness matrix](evidence/natural-conversation/awareness-MATRIX.md) | 32/32; includes silence for empty proactive output instead of canned speech. |
| Permission, autoplay, errors, stale microphone ownership | [Recovery matrix](evidence/natural-conversation/recovery-MATRIX.md) | 14/14 with controlled browser failures. |
| Build, typechecking, backend policies, budget and watchdog | Local `npm run verify` on each app | 39/39 per app; production npm audit zero vulnerabilities. |
| Assets, browser errors, network errors, headers | [QA report](evidence/natural-conversation/production-qa.json), [asset readback](evidence/natural-conversation/production-assets.json) | Expected assets and security headers. Zero console/page/HTTP/network failures in the primary automated suite. Initial readback briefly showed low available funds while recent confirmed calls retained grace-period holds; final accounting below supersedes availability only. |
| Spending authorization and shutdown | [Final readback](evidence/natural-conversation/final-budget.jsonl) | Original combined $10 authorization, no top-up or ledger reset. Each new call reserves $0.50, confirmed usage settles conservatively after grace; unknown holds remain. Final readback: both voiceAvailable true; conservative remaining headroom AgentMart $0.657497 and portfolio $1.048329. Recent holds may settle after their grace period. |

The captured beginnings were generated as “Hey! I'm M, your little market scout” and “Hey! I'm Pip, the AI on Shanto's site,”. These are partial samples taken before synthetic visitor interruption, not complete openings or hardcoded templates. Repeated words or similar greetings remain possible. Human-rated naturalness and the full range of emotional performances are not certified by these tests.

Budget and runtime limits remain deliberate: the browser ends at 110 seconds, server watchdog at 120 seconds, and idle handling is also present at three minutes; the shorter trial ceiling takes precedence. The $10 envelope covers both public prototypes plus the development hold. Health estimates and reservations are not a provider billing invoice or account-level hard cap. See [speech recovery](SPEECH_RECOVERY.md) for the accounting fix and historical evidence.
