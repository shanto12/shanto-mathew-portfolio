# Automatic portfolio voice startup

September 12, 2026, Central Time.

The production portfolio at https://shantomathew.com/ and https://shanto-portfolio-live.netlify.app/ now uses deployment `6aa5832350d7dce61c8fe0f6` on Netlify site `296ec6fb-3f43-4253-9aad-c55f677685d0`. The runtime patch is based directly on `de975c6` in branch `codex/portfolio-voice-startup-fix`. The separate atmosphere review is not included.

## Problem and resulting behavior

The owner's existing Chrome tab was silent, displaying an internal “Conversation ended” status without recovery guidance. Its audio element was paused at time zero. Available evidence does not establish which startup path caused that visit to fail. Three independent failure paths were reproduced using the actual shipped client: hiding the page during pending microphone startup prevented recovery; a missing greeting acknowledgment left a connected session silent; and a missing session-start event left the avatar connecting without a short deadline.

Startup now resumes on visibility return if it was interrupted before any paid admission attempt. A connected session starts its fresh, dynamic greeting after the instruction acknowledgment, with a 750 ms fallback if that acknowledgment does not arrive. Prior visitor or model speech suppresses the fallback. After microphone acquisition, a 30-second connection deadline closes local resources and exposes the existing avatar recovery path. Late server tokens are still received and closed. These paths do not automatically retry paid admission.

The avatar, personality, pages, visible controls, ten-minute maximum, three-minute inactivity cutoff, approved $30 combined cap, and budget configuration remain the same. The existing compact recovery message also explains connecting state. Browser microphone permission, sound policy, transport setup and model generation still apply; this patch cannot promise zero-latency audio.

## Current release evidence

Evidence files are in `evidence/domain-startup-fix/`.

| Requirement | Method and evidence | Result and limit |
|---|---|---|
| Original failures reproduced | Actual prior voice.js with mocked microphone/RTC/API; before-startup.json | All three described failure paths reproduced |
| Build and backend checks | npm-verify.txt | Build and 51 tests passed |
| Production dependency audit | npm-audit.json | Zero reported vulnerabilities |
| Startup and recovery | startup-local.json, startup-production.json, STARTUP_PRODUCTION.md | 34/34 locally and on the deployed custom domain; microphone/RTC/mutating API calls mocked |
| Automatic greeting in owner's Chrome | real-chrome-after.json | Actual reload, model greeting and advancing unpaused browser audio; no avatar click before greeting |
| Explicit stop and server shutdown | real-chrome-after.json, budget-final.jsonl | Escape stopped playback; provider session closure and final usage verified independently |
| Full portfolio controls and workflows | site-production.json, SITE_PRODUCTION.md | 17/17 production groups: all 14 project previews/cases, image inspection, filters, keyboard controls, career, appearance and navigation; voice mocked |
| Owner-profile manual page pass | real-chrome-after.json | Work, filters, next project, case navigation, section navigation, motion, reset and home passed; this is a subset of the full automated inventory |
| Mobile layout and controls | SITE_PRODUCTION.md | Automated Chrome at 390 × 844; not a physical phone test |
| Runtime and first-party network errors | site-production.json; real-chrome-after.json | No errors in final automation or warnings/errors in the owner's Chrome log |
| Public URLs, source and security | assets.json, final-preflight.json | Deployed voice.js matches source; HTTPS, redirects and configured CSP/security headers checked |
| Auth, logout, password manager, submissions | Application scope | No account or submission workflow in this portfolio |
| External demos | Application scope | Destinations checked; separate demo applications were not retested |

The real-profile recording establishes a generated greeting and active audio playback, not subjective human hearing. First-audio latency was not measured because native browser inspection was delayed by another foreground activity. It would be misleading to label that delay as model latency or claim an instant greeting based on this run.

## Budget and rollback

One earlier startup during the investigation created session slot 25, closed by the watchdog after connection loss with 15 seconds of final provider usage. The final real-Chrome reload created slot 26, closed on request with 105 seconds of final provider usage. Total new confirmed voice duration: 120 seconds. At the configured $0.05/minute rate, the local voice estimate is $0.10; this is not a provider invoice and excludes any planner usage. The local guard also conservatively retains planner allowances and holds an admission until its original ten-minute deadline plus 30 seconds. Neither ledger nor environment allocations were reset or increased.

For runtime rollback, restore previous deploy `6aa48294fa3641527184f0bc` on the same Netlify site. Keep the domain mapping, environment, API keys and budget ledger intact. The original Fieldwork backup and atmosphere-review deployments remain independently available.
