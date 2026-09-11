# Voice recovery evidence

9/11/2026, 2:26:27 PM Central Time

Isolated Chrome; actual shipped scripts; mocked microphone/RTC/play and all POST requests. No provider/admission calls.

| Site | Check | Result | Error |
|---|---|---|---|
| agentmart | Pending microphone gives visible accessible recovery instructions; Escape clears them | PASS |  |
| agentmart | Denied microphone gives a compact visible permission-recovery hint | PASS |  |
| agentmart | 429 allowance is visible and releases acquired microphone tracks | PASS |  |
| agentmart | Autoplay rejection explains tap recovery; avatar resumes audio and hides hint | PASS |  |
| agentmart | Connected avatar has no recovery writing; End stops tracks and stays quiet | PASS |  |
| agentmart | Stale getUserMedia resolves without replacing or stopping the current microphone | PASS |  |
| agentmart | Stale microphone completion cannot dismiss a newer permission prompt | PASS |  |
| portfolio | Pending microphone gives visible accessible recovery instructions; Escape clears them | PASS |  |
| portfolio | Denied microphone gives a compact visible permission-recovery hint | PASS |  |
| portfolio | 429 allowance is visible and releases acquired microphone tracks | PASS |  |
| portfolio | Autoplay rejection explains tap recovery; avatar resumes audio and hides hint | PASS |  |
| portfolio | Connected avatar has no recovery writing; End stops tracks and stays quiet | PASS |  |
| portfolio | Stale getUserMedia resolves without replacing or stopping the current microphone | PASS |  |
| portfolio | Stale microphone completion cannot dismiss a newer permission prompt | PASS |  |
