# Portfolio startup and recovery evidence

9/12/2026, 11:53:40 AM Central Time

Isolated Chrome; actual shipped scripts; mocked microphone/RTC/play and all POST requests. No provider/admission calls.

| Site | Check | Result | Error |
|---|---|---|---|
| portfolio | Page load starts microphone and dynamic greeting without any page interaction | PASS |  |
| portfolio | Normal page click unlocks blocked audio without clicking the avatar or admitting a second call | PASS |  |
| portfolio | Normal keyboard interaction unlocks blocked audio without avatar activation | PASS |  |
| portfolio | Browser microphone permission grant resumes failed startup without an avatar click | PASS |  |
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
| portfolio | Missing greeting ACK gets one bounded fresh opening and ignores a late acknowledgment | PASS |  |
| portfolio | Normal greeting acknowledgment does not duplicate its opening at fallback deadline | PASS |  |
| portfolio | Opening fallback respects prior visitor speech | PASS |  |
| portfolio | Opening fallback respects prior model output | PASS |  |
| portfolio | Opening fallback respects mute and explicit End | PASS |  |
| portfolio | Initially hidden page defers microphone and admission until first visible return | PASS |  |
| portfolio | Hidden during pending microphone resumes one unpaid startup and releases the stale stream | PASS |  |
| portfolio | Explicit Escape cancels deferred startup before any microphone or paid admission | PASS |  |
| portfolio | Pagehide cancels deferred startup and does not resume on visible return | PASS |  |
| portfolio | Hidden connected conversation stays ended on visible return with avatar recovery | PASS |  |
| portfolio | Missing session.started has visible connecting guidance and 30-second resource cleanup | PASS |  |
| portfolio | Pending admission times out locally while a late token is still closed exactly once | PASS |  |
| portfolio | Hidden admission attempt never auto-retries and its late token is closed | PASS |  |
| portfolio | Old greeting timers and ACK cannot greet or end a newly restarted connection | PASS |  |
| portfolio | Stale getUserMedia resolves without replacing or stopping the current microphone | PASS |  |
| portfolio | Stale microphone completion cannot dismiss a newer permission prompt | PASS |  |
