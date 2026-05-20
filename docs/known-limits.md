# Known Limits

- Contact submissions rely on Netlify Forms in production. The `/api/contact` function validates and logs metadata but does not send email by itself.
- The custom domain `ShantoMathew.com` requires DNS changes in IONOS after the Netlify site exists.
- Some demo cards have GitHub source links only when the local inventory found a public repo URL.
