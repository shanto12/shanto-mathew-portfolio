# Personality and website awareness

This extension keeps M (AgentMart's playful market scout) and Pip (Shanto's witty career advocate) in the existing compact, avatar-only interface. It adds natural, occasional expressive delivery and context-aware suggestions. Expressions are performances: neither guide claims human identity, actual feelings, or knowledge of a visitor's inner state.

## Context and privacy

Each site bridge exposes `siteGuide.getContext()` with the current section, open product/project, up to three visible item IDs and eight recent semantic visitor actions. IDs refer to the site's own catalog. The bridge's small metadata list is drawn from owned product/project definitions, never scraped from arbitrary page text. Only trusted native click, keyboard and settled scrolling interactions enter the action history. Model-triggered navigation updates current context but cannot generate another visitor-activity event.

The voice runtime projects this into a strict ID-only snapshot. It sends changed snapshots over the existing Live thinking channel after a 400 ms debounce. Delegated Responses requests carry the snapshot and `state:{}`. Freeform searches, demo agent names, budgets, seller form values, DOM text and page HTML do not enter these context fields. Spoken input and conversation history still go to the provider as necessary for the conversation. Browsing observations stay in page memory; reloading clears the recent-action history. Presentation preferences retain the pre-existing tab-session behavior.

“Visible” means that a card intersects this website's viewport. This is not eye tracking, screen capture, access to other tabs, or external browsing history. Rule-based intent hints are low/medium-confidence task guesses (for example, comparing after Compare, or evaluating after opening an item). The server validates all IDs against trusted site facts and treats the hint as fallible. The guide should ask rather than assert what a visitor wants. Demographic, financial, health and emotional profiling are excluded.

## Conversation behavior

M helps visitors identify the job for a tool and compare relevant sample capabilities. AgentMart remains an illustrative marketplace with no real purchasing or provisioning. Pip connects recruiter needs to Shanto's documented skills, experience and project evidence; it does not invent achievements, pay, offers, availability or hiring outcomes.

The optional server-validated `performance` object contains one of seven emotions and one of seven fixed delivery styles: neutral, warm, laugh, mock cry, mock grumpy, whisper or surprised. The client maps these enums to brief voice instructions and compact facial expressions. Delivery accents clear after 4.5 seconds. Animation respects reduced-motion preferences. The AI's natural speech is generative, so the precise laugh, sigh or delivery is not deterministic audio playback.

“Be serious”, “no jokes” and equivalent explicit requests suppress playful delivery; “give me space”, “stop selling” or “stop interrupting” suppress unsolicited prompts. Explicit requests to resume guidance or playfulness restore them. The last recognized preference in an utterance wins. The Live prompt additionally handles conversational phrasing beyond these local fast-path phrases.

A relevant trusted visitor action can schedule one optional suggestion after at least six seconds of dwell and at least 25 seconds from connection or the prior suggestion. Suggestions do not run while muted, hidden, audio-blocked, typing, responding to speech, visibly speaking, or waiting for another planner request. New activity, user speech, muting or End cancels/stales a pending suggestion. Proactive responses are server-enforced to contain no page-changing actions and at most one short question. Normal visitor requests retain the allowlisted session-only page actions.

Proactive suggestions and the existing silence reminders **share a maximum of two unsolicited attempts per call**. They consume the existing ten-request planner allowance, not a new quota. AI output never resets the three-minute visitor-inactivity timer. The stricter trial limits remain 110 browser seconds and 120 server seconds, so the current trial ends before three full idle minutes. No admission permits, ledgers, spending limits or credentials were reset or increased for this extension.

## Verification scope

See the current `PERSONALITY_RELEASE_EVIDENCE.md` for deployed revision checks, automated versus real-Chrome scope, live-provider evidence and remaining trial allowance. Simulated model responses validate the deterministic interface and lifecycle; they do not prove subjective voice quality or model judgment across arbitrary conversations.
