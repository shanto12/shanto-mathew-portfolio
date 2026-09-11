# Voice recovery evidence

9/11/2026, 4:57:58 PM Central Time

Isolated Chrome; actual shipped scripts; mocked microphone/RTC/play and all POST requests. No provider/admission calls.

| Site | Check | Result | Error |
|---|---|---|---|
| agentmart | Pending microphone gives visible accessible recovery instructions; Escape clears them | PASS |  |
| agentmart | Denied microphone gives a compact visible permission-recovery hint | PASS |  |
| agentmart | 429 allowance is visible and releases acquired microphone tracks | PASS |  |
| agentmart | Autoplay rejection explains tap recovery; avatar resumes audio and hides hint | PASS |  |
| agentmart | Connected avatar has no recovery writing; End stops tracks and stays quiet | PASS |  |
| agentmart | Active avatar mutes and unmutes; normal End then avatar click starts exactly one fresh call | PASS |  |
| agentmart | Expired session returns avatar to restartable state without automatic admission | PASS |  |
| agentmart | Provider-ended session enables explicit avatar restart and ignores old events | PASS |  |
| agentmart | Lost connection closes resources and same avatar recovers after explicit click | PASS |  |
| agentmart | Rejected admission retries only after avatar click and releases old microphone | PASS |  |
| agentmart | Denied microphone can recover on the same avatar after browser permission changes | PASS |  |
| agentmart | Failed close send and resource cleanup cannot wedge restart or revive late events | PASS |  |
| agentmart | Missing provider closure falls back locally and allows an explicit restart | PASS |  |
| agentmart | Three-minute visitor inactivity still closes a longer fixture call | PASS |  |
| agentmart | Stale getUserMedia resolves without replacing or stopping the current microphone | PASS |  |
| agentmart | Stale microphone completion cannot dismiss a newer permission prompt | PASS |  |
| portfolio | Pending microphone gives visible accessible recovery instructions; Escape clears them | PASS |  |
| portfolio | Denied microphone gives a compact visible permission-recovery hint | PASS |  |
| portfolio | 429 allowance is visible and releases acquired microphone tracks | PASS |  |
| portfolio | Autoplay rejection explains tap recovery; avatar resumes audio and hides hint | PASS |  |
| portfolio | Connected avatar has no recovery writing; End stops tracks and stays quiet | PASS |  |
| portfolio | Active avatar mutes and unmutes; normal End then avatar click starts exactly one fresh call | PASS |  |
| portfolio | Expired session returns avatar to restartable state without automatic admission | PASS |  |
| portfolio | Provider-ended session enables explicit avatar restart and ignores old events | PASS |  |
| portfolio | Lost connection closes resources and same avatar recovers after explicit click | PASS |  |
| portfolio | Rejected admission retries only after avatar click and releases old microphone | PASS |  |
| portfolio | Denied microphone can recover on the same avatar after browser permission changes | PASS |  |
| portfolio | Failed close send and resource cleanup cannot wedge restart or revive late events | PASS |  |
| portfolio | Missing provider closure falls back locally and allows an explicit restart | PASS |  |
| portfolio | Three-minute visitor inactivity still closes a longer fixture call | PASS |  |
| portfolio | Stale getUserMedia resolves without replacing or stopping the current microphone | PASS |  |
| portfolio | Stale microphone completion cannot dismiss a newer permission prompt | PASS |  |
