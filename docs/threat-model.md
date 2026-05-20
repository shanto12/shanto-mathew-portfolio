# Threat Model

| Risk | Impact | Mitigation |
|---|---:|---|
| Sensitive personal details exposed | High | Use only public-safe profile facts; exclude phone, birthdate, home address, identity docs, rates, and private recruiter context. |
| Contact form spam | Medium | Netlify Forms honeypot plus server-side validation. Add rate limiting if abuse appears. |
| Stored secret leak | Low | Site requires no API key. No `.env` values are committed. |
| External link confusion | Medium | Demo links point directly to Netlify production URLs and open in a new tab. |
| Broken production deploy | Medium | Verify local build, Playwright, live `/`, live `/api/health`, headers, and real Chrome click pass before final handoff. |
| Overclaiming demo evidence | Medium | Evidence matrix separates local, Playwright, API, real Chrome, header, and production checks. |
