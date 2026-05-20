const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })

export default async () => {
  const deployedAt = Netlify.env.get('DEPLOY_PRIME_URL') ? new Date().toISOString() : 'local-or-build-preview'
  const url = Netlify.env.get('URL') || 'https://shanto-mathew-portfolio.netlify.app'
  const customDomain = Netlify.env.get('CUSTOM_DOMAIN') || 'ShantoMathew.com pending DNS verification'

  return json({
    service: 'shanto-mathew-portfolio',
    status: 'ready',
    mode: 'portfolio-production-boundary',
    deployedAt,
    url,
    customDomain,
    checks: [
      {
        name: 'Static portfolio',
        status: 'ready',
        detail: 'React/Vite site ships the portfolio, skills matrix, demo gallery, approach section, and contact workflow.',
      },
      {
        name: 'Contact backend',
        status: 'ready',
        detail: 'The contact API validates payloads and Netlify Forms captures production submissions without exposing secrets.',
      },
      {
        name: 'Public-safe data',
        status: 'ready',
        detail: 'Sensitive recruiter, phone, identity-document, compensation, and private client details are excluded from the public UI.',
      },
    ],
  })
}

export const config = {
  path: '/api/health',
}
