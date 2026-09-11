# Production watchdog evidence

9/11/2026, 10:12:40 AM Central Time

Actual deployed server watchdog test with only the 110-second browser close timer suppressed; isolated Chrome and silent fake microphone. No server controls or API responses bypassed.

The 120-second deadline is measured from server reservation creation. Connection setup consumes part of that window, so connected duration may be shorter. Timing is measured independently from the first /api/live request and session.started event.

| Check | Result | Detail |
|---|---|---|
| Actual voice session started and exactly the 110-second client timer was suppressed | PASS |  |
| Provider session.closed confirms server-initiated close near the 120-second reservation deadline | PASS |  |
| Provider close event triggered complete application microphone/peer cleanup | PASS |  |
| Actual incoming WebRTC audio bytes and non-silent greeting observed | PASS |  |

This run proves only its observed session; it does not establish a provider-enforced hard billing cap under network failure.
