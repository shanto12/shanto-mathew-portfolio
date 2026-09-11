# Approved custom-domain release

September 11, 2026, Central Time.

The approved Fieldwork + Pip voice portfolio now serves https://shantomathew.com/ and https://shanto-portfolio-live.netlify.app/. https://www.shantomathew.com/ redirects to the apex. The original portfolio remains intact at https://shanto-fieldwork-portfolio.netlify.app/ (original deploy `6aa1d197f09280f08595e246`). The actual owned domain was verified in Netlify as shantomathew.com; no change was made to the unrelated shanto.mathew.com.

Current live site: `296ec6fb-3f43-4253-9aad-c55f677685d0`; deployment `6aa48294fa3641527184f0bc`. Original/backup site: `ee94b075-3cd9-4394-b5f3-9e4ad0458a4d`.

## Behavior

Voice starts immediately when the module loads, requests microphone permission, and generates a fresh greeting after the WebRTC session connects. No artificial startup delay and no added buttons. Normal page interaction can recover blocked playback; granting a denied microphone permission can recover startup automatically. Explicit end, budget rejection, expiry and hidden-page shutdown do not auto-restart.

Two real Chrome/WebRTC tests used default autoplay policy, a pre-granted synthetic microphone, and zero page clicks before greeting. First non-silent incoming samples were measured at 7.20s on Netlify and 7.86s on the custom domain after navigation (about 5.90s and 6.06s after page load). Literal zero-delay audio is not achievable: browser permission, transport setup and model latency still apply. In the real user profile, microphone permission was requested immediately and voice connected after Allow this time, without an avatar click.

The API accepts only explicitly configured HTTPS origins: the preview, apex and www. SITE_ORIGIN remains the preview address for watchdog calls; SITE_ADDITIONAL_ORIGINS is the two custom origins. No wildcard CORS or arbitrary origins were added. The same ledger, $30 combined approval, 600-second maximum and 180-second inactivity cutoff remain in place. AgentMart source and domain were not changed.

## Evidence matrix

| Requirement | Evidence | Result and scope |
|---|---|---|
| Original backup preserved | evidence/domain-migration/final-backup-fingerprints.json | 23/23 original HTML/assets/images match |
| Domain ownership and HTTPS | domain-transfer.json; final-url-preflight.json | Apex assigned to live site; www alias; valid certificate; HTTPS forced |
| Exact deployed source | GUI_DOMAIN.md; GUI_NETLIFY.md | Local versus served runtime assets match |
| Backend quality gates | npm run verify | 51 tests passed; build/type checks passed |
| Dependency audit | production npm audit | Zero vulnerabilities |
| Startup recovery edge cases | autostart-local.json | 20 mocked browser checks passed; no paid requests |
| Desktop/mobile and all projects | GUI_DOMAIN.md; GUI_NETLIFY.md | 17/17 groups each: 14 projects/cases, filters, dialogs, mobile controls, appearance/effects, accessibility and errors; voice mocked |
| Actual voice on Netlify | live-netlify.json | 8/8 real provider checks, greeting with zero clicks, transcription, page actions, career response, mute/unmute and shutdown |
| Actual voice on custom domain | live-domain.json | 8/8 same real provider checks with default autoplay |
| Final provider closure | budget-after.jsonl | Test calls have final usage and confirmed closure; no invented invoice totals |
| Real user Chrome | REAL_CHROME.md | Native microphone prompt and automatic connection, Escape shutdown, manual desktop gallery/navigation/inspection/career/motion controls |
| Console/network/security | live JSON, GUI matrices, final-url-preflight.json | No runtime or first-party network errors in final automation; security headers present |
| Auth/logout/password manager/backend jobs | Application scope | No login or submission workflow; voice watchdog verified by real provider closure |
| External demo functionality | Scope boundary | Portfolio links verified as navigation destinations; no claim to retest every separately hosted demo application |

## Rollback

The backup deployment and its Netlify hostname have not changed. To restore the original custom-domain experience, detach the apex/www from the live site and assign them to the backup site. Keep the live Netlify URL, API origin configuration and ledger intact. Netlify automatically associates/provisions the certificate on reassignment; wait for SSL state `issued` before setting force_ssl=true. Do not provision a second certificate over an existing one: Netlify returns a 422 for that operation. Verify public HTTPS and the backup fingerprint after rollback. No registrar or unrelated DNS records were changed during this migration.

The provider's requested certificate ordering briefly rejected an initial assignment with force_ssl=true. Assignment without that field succeeded, Netlify associated the existing issued certificate, then force_ssl=true succeeded. Final public apex/www TLS and URLs were verified after this correction.
