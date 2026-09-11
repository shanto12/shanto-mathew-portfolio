# Actual deployed voice evidence

9/11/2026, 10:55:38 AM Central Time

Actual deployed WebRTC/API, isolated Chrome, synthetic visitor audio; no API responses mocked. Does not verify a human microphone, subjective audio quality, or the real Chrome profile.

Browser End evidence alone does not establish final provider billing; verify server-side session.closed records separately.

| Site | Check | Result | Detail |
|---|---|---|---|
| agentmart | Actual deployed session connects and automatically greets with audible remote audio | PASS |  |
| agentmart | Synthetic spoken visitor request is transcribed over the real WebRTC connection | PASS |  |
| agentmart | Spoken request changes the page and expressive avatar | PASS |  |
| agentmart | Spoken navigation and confetti effect apply through the real planner | PASS |  |
| agentmart | Mute and unmute control the actual outgoing audio track | PASS |  |
| agentmart | End closes the peer and stops all local/remote audio tracks | PASS |  |
| agentmart | WebRTC statistics confirm incoming audio packets | PASS |  |
| portfolio | Actual deployed session connects and automatically greets with audible remote audio | PASS |  |
| portfolio | Synthetic spoken visitor request is transcribed over the real WebRTC connection | PASS |  |
| portfolio | Spoken request changes the page and expressive avatar | PASS |  |
| portfolio | Spoken navigation and confetti effect apply through the real planner | PASS |  |
| portfolio | Live workflow | FAIL | Command failed: /usr/bin/say --file-format=WAVE --data-format=LEI16@24000 -r 200 -o /Users/shanto/Documents/Playground/gpt-live-sites/output/playwright/live-2026-09-11-10-55-38/portfolio-career-question.wav Why should I hire Shanto for a senior AI engineer role? Please keep it brief.  |
| portfolio | End closes the peer and stops all local/remote audio tracks | PASS |  |
| portfolio | WebRTC statistics confirm incoming audio packets | PASS |  |

Portfolio qualification: the recorded failure occurred in the local macOS say utility while generating synthetic career-question audio. It is a test-harness failure, not observed evidence of an application failure. The career-pitch retry is separately pending. The original FAIL is retained.
