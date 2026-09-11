# Portfolio evidence bundle

All times are September 11, 2026, America/Chicago. **Final compact evidence is now available for both served sites.** Historical and final runs are distinguished below; the final portfolio compact UI is automation-only, while AgentMart has selected final real Chrome observations.

| Evidence | Scope |
|---|---|
| [Final portfolio retry matrix](compact-final/PORTFOLIO_RETRY_MATRIX.md), [JSON](compact-final/portfolio-retry-live.json) | 10:59:16 AM: 8/8 actual checks passed, including start of a career-fit spoken answer, navigation/confetti, avatar mute/unmute and Escape/provider closure. Not a full qualitative pitch evaluation. |
| [Final compact GUI matrix](compact-final/GUI_EVIDENCE_MATRIX.md), [site JSON](compact-final/gui-verification.json) | 10:55:39 AM: 33/33 checks across both production pages, mocked paid APIs/synthetic RTC; zero recorded runtime/first-party resource errors. |
| [Final compact actual voice matrix](compact-final/LIVE_EVIDENCE_MATRIX.md), [site JSON](compact-final/live-verification.json) | 10:55:38 AM run: AgentMart 7/7 passed; portfolio 6 passed plus a local synthetic-audio generation timeout during the career question. No provider API responses mocked. Portfolio retry subsequently passed 8/8; see portfolio retry artifacts. |
| [Final served hashes](compact-final/served-assets.json) | Compact deployments and matching local/canonical runtime hash. |
| [Final desktop](compact-final/desktop.png), [mobile](compact-final/mobile.png) | Selected small screenshots from the automated compact GUI run. |
| [Selected compact real Chrome observations](compact-final/REAL_CHROME.md) | AgentMart click mute/unmute and Escape End observed in real profile; portfolio final compact UI is automation-only. |

| [Compact avatar/idle mocked verification](avatar-idle-mock-verification.json) | 10:55:27 AM: 32 shared runtime checks in isolated Chrome with mocked HTTP/media and virtual time. Includes gestures, sizes, effects, reduced motion, pending-permission invitation and visitor-only inactivity. Not production evidence. |
| [Latest precompact live matrix](precompact-1041/LIVE_EVIDENCE_MATRIX.md), [site JSON](precompact-1041/live-verification.json) | Approximately 10:41 AM: actual deployed WebRTC/OpenAI APIs, isolated Chrome with synthetic speech; seven checks per site, no response mocking. Larger inline presenter. |
| [Latest precompact GUI matrix](precompact-1041/GUI_EVIDENCE_MATRIX.md), [site JSON](precompact-1041/gui-verification.json) | 10:41:28 AM: 36 checks across both production pages; paid APIs mocked and microphone denied. Includes larger presenter's visible typing/control UI, later removed by user instruction. |
| [Precompact served assets](precompact-1041/served-assets.json) | Hashes for deployment `6aa420e539e36f1a8938b95e`; not final compact asset proof. |
| [Real Chrome on both sites](PRECOMPACT_REAL_CHROME.md) | Approximately 10:40–10:44 AM: Shanto's Chrome Person 1 profile, actual microphone permission/greeting/mute/typed changes/End. Selected actions, not every-control audit. |
| [Production audit and lifecycle review](precompact-audit.json) | Zero reported production dependency vulnerabilities per site at 10:38 AM; credential-pattern scan had no findings. Lifecycle review at 10:41 AM exercised mocked shutdown regressions. This snapshot precedes compact controls/effects. |
| [Earlier live matrix](LIVE_EVIDENCE_MATRIX.md), [JSON](live-verification.json) | 10:28:49 AM actual isolated-Chrome/synthetic-audio check; historical. |
| [Earlier GUI matrix](GUI_EVIDENCE_MATRIX.md), [JSON](gui-verification.json) | 10:29:03 AM mocked-API GUI check; historical. |
| [Earlier selected AgentMart manual record](REAL_CHROME_OBSERVATIONS.md) | Approximately 10:32 AM and prior actions; superseded by the later real Chrome record above. Its then-pending portfolio status is historical. |
| [Watchdog matrix](WATCHDOG_EVIDENCE.md), [JSON](watchdog-verification.json) | 10:12:40 AM, portfolio only: shared watchdog produced provider close near 120 seconds with browser timer suppressed. Not independent timed evidence for both sites. |
| [Admission proof](admission-proof.json) | 10:28:28 AM: twelve production Blobs conditional creates per site; one confirmed winner/readback. Separate verification keys, no provider charges. |
| [Final release accounting](final-budget.json) | AgentMart 6 admitted/2 remaining; portfolio 7 admitted/1 remaining. Confirmed voice costs only, with unknown sessions retaining full reservations; not total API invoice. |
| [Development accounting](development-budget.json) | Archived development ledger summary, including unknown-session reservation; not a final invoice. |

JSON copies are filtered to this site where appropriate and remove credential-shaped fields, SDP, recording paths and screenshot references. Matrices retain cross-site context. Large audio/video/screenshots are not bundled. Original evidence remains in the coordinating output directory. See [the release matrix](../RELEASE_EVIDENCE.md) for current gaps.

- [Final local verification](final-local-verification.json)
- [Final credential-pattern scan](final-secret-scan.json)
