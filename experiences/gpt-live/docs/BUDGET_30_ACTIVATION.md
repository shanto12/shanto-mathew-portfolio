# $30 voice budget activation

Verified September 11, 2026 at 05:16 PM Central Time.

Owner authorization: “spending cap increased to $30.” This supersedes the previous funding-pending status. It is a combined $30 total, not $30 per site and not $30 additional. Production allocation: AgentMart$14, portfolio$14, retained development hold$2. Existing usage was preserved without resetting the ledger.

Portfolio: https://shanto-portfolio-live.netlify.app/ — ready deploy6aa47d0dcfe1371ccaf650a5.
AgentMart: https://agentmart-live-shanto.netlify.app/ — ready deploy6aa47d0f06b9dd1285b76a7c.

Both production health endpoints confirm totalApprovedUSD30, siteEnvelopeUSD14, sessionSeconds600 and voiceAvailabletrue. No GUI, source logic or custom domain changed. Click the existing avatar to retry if a previous tab still shows the allowance message. Ten-minute maximum and three-minute inactivity cutoff remain.

Netlify connector and CLI initially reported success without persisting function-scoped settings. A direct API read verified absence; a direct write exposed HTTP403: account upgrade required for specific scopes. The three non-secret budget settings were then successfully saved using the account-supported default scopes, production context, with HTTP201 and exact readback. No plan upgrade or secret scopes were changed. Both sites were rebuilt after this correction.

| Requirement | Evidence | Result / limits |
|---|---|---|
| $30 activation and14/14/2 split | readback.json | Both public health responses confirmed configuration and admission available. |
| Actual voice and page actions | portfolio/ and agentmart/ live-verification.json | 8 portfolio checks and7 AgentMart checks passed. Real deployed provider/WebRTC audio with synthetic visitor microphone: spontaneous greeting, transcription, theme/avatar changes, navigation/confetti, mute/unmute, provider close event and ended tracks. Portfolio also answered a career-fit question. No responses were mocked. |
| Calls closed and accounted | after-test.jsonl | One new call per site; final provider usage confirmed19seconds portfolio and15seconds AgentMart. Both closed and no stale connection block. Full new-call holds remain until the normal reconciliation grace period; these holds are not actual invoices. |
| Real Chrome | CUA native Chrome /api/health inspection | Portfolio response visibly showed totalApprovedUSD30,600seconds and voiceAvailabletrue. Temporary tab closed. Actual spoken-action tests used isolated Chrome and synthetic microphone, not the user's human microphone. |
| Static source and original domains | readback.json | JS/CSS exact source; HTML matches after Netlify hosting attribution normalization. shantomathew.com and its original Netlify copy unchanged. |
| Ten actual elapsed minutes | Prior virtual-clock/backend test suite | Not rerun as a ten-minute paid call;600second config verified and short actual calls passed. |

No provider account-wide billing setting was modified. This cap is enforced by the existing application admission budget; it does not govern unrelated API usage outside these two previews.
