# Portfolio compact-avatar release evidence

URL: [https://shanto-portfolio-live.netlify.app](https://shanto-portfolio-live.netlify.app); branch `codex/gpt-live-experience`. Deployment: `6aa42410875c3a05d4f75ebc`. Commit: recorded by coordinating source-control closeout.

Both served runtime copies match canonical voice.js SHA-256 `1231985bc345b6bf61ba87254b6991ddc5667ac5dd47189ec4c772890ecb2952`. Evidence was recorded September 11, 2026, Central Time. The UI is avatar-only: about 100px desktop/76px mobile, no default visible copy/control row or typing panel. Click controls mute/reconnect/playback; Escape ends.

| Requirement | Evidence/result | Method and precise limitation |
|---|---|---|
| Policy, invalid actions and safeguards | 20 checks/app reported by coordinator | Local unit baseline |
| Avatar gestures, effects, reduced motion and inactivity | [32 checks passed](evidence/avatar-idle-mock-verification.json) | Isolated browser, mocked HTTP/media and virtual clock; no paid calls |
| All visible primary website workflows and layouts | [33/33 across both sites](evidence/compact-final/GUI_EVIDENCE_MATRIX.md), at 10:55:39 AM | Production pages, paid APIs intercepted and media/RTC mocked; this site's 15 checks passed |
| Avatar-only appearance and small responsive placement | PASS in final GUI run; [desktop](evidence/compact-final/desktop.png) / [mobile](evidence/compact-final/mobile.png) | Automated screenshots and 390/768/320px checks |
| Actual greeting, speech, page/expression changes and navigation/confetti | Final retry: 8/8 actual checks passed; earlier local say timeout retained as historical fixture failure | [Final real WebRTC/API run](evidence/compact-final/PORTFOLIO_RETRY_MATRIX.md), isolated Chrome with synthetic visitor audio; no API-response mocking |
| Mute/unmute and Escape/provider closure | Final actual retry verified avatar mute/unmute, Escape and provider closure | [Site live JSON](evidence/compact-final/portfolio-retry-live.json); browser closure alone is not a final invoice |
| Real Chrome profile | Both-site precompact real-profile voice proof exists; final compact portfolio presentation/control coverage is automated only | [Selected final observations](evidence/compact-final/REAL_CHROME.md), [earlier both-site record](evidence/PRECOMPACT_REAL_CHROME.md). Full website control/layout coverage remains automation-only |
| All five effects and seven expressions | PASS in final GUI suite; confetti also observed with actual spoken planner | Effects other than real confetti are mocked-API evidence; bounded runtime cleanup/reduced motion are verified in mocked suite |
| Visitor inactivity and invitations | 180-second visitor-only timer, at most two connected nudges and local pending-permission invitation passed virtual-clock tests | Unchanged 110-second browser/120-second server trial ends sooner; a three-minute paid idle session is not claimed |
| Portfolio career advocacy | Server-only verified-fact pitch implemented | Actual career answer began on retry (strong Python reference); full qualitative pitch not evaluated; no invented salary/credentials/commitments authorized |
| Atomic admission | [12 conditional creates, exactly one winner](evidence/admission-proof.json) per site | Actual Blobs; separate verification keys, no provider calls |
| Server watchdog deadline | [Earlier portfolio provider close near 120 seconds](evidence/WATCHDOG_EVIDENCE.md) | Shared-component production proof with browser timer suppressed; not an outage guarantee or independent timed test on both sites |
| Served assets and headers | [Final hashes](evidence/compact-final/served-assets.json) and [served headers](evidence/compact-final/gui-verification.json) captured; runtime/canonical match | Final GUI run had zero recorded browser errors or failed first-party resources |
| Production audit/credential scan | [Zero production dependency vulnerabilities, no credential-pattern findings](evidence/precompact-audit.json) | Recorded unchanged dependency-tree audit; not a complete security audit |
| Budget | Eight immutable $0.50 release reservations/site; original $10 total authorization unchanged | Final ledger: AgentMart 6 admitted/2 remain, portfolio 7/1 remain; known voice ~$0.688333 including development, not total API bill; full unknown reservations retained |
| Authentication/commerce | No new auth, payment, provisioning or commercial integration | Not applicable; original local/demo disclosure remains |

Portfolio retry passed 8/8 at 10:59:16 AM. Final accounting is in [the ledger snapshot](evidence/final-budget.json); deployed source commit is `af3bee4`. Portfolio compact manual coverage is a stated limitation, not a claimed pass. Automated-only items are explicitly labeled; this document does not claim a full enterprise-grade release or every-control real Chrome audit.

[Final portfolio retry matrix](evidence/compact-final/PORTFOLIO_RETRY_MATRIX.md) and [sanitized JSON](evidence/compact-final/portfolio-retry-live.json) supersede the earlier local audio-generation timeout.
