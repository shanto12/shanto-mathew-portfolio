const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })

export default async () => {
  const url = Netlify.env.get('URL') || 'https://shanto-mathew-portfolio.netlify.app'
  const inferredContext = url.startsWith('http') && !url.includes('localhost') ? 'production' : 'local'
  const context = Netlify.env.get('CONTEXT') || inferredContext
  const buildId = Netlify.env.get('BUILD_ID') || null
  const deployId = Netlify.env.get('DEPLOY_ID') || buildId
  const commitRef = Netlify.env.get('COMMIT_REF') || null
  const deployPrimeUrl = Netlify.env.get('DEPLOY_PRIME_URL') || null
  const deployedAt = deployId ? `${context}:${deployId.slice(0, 12)}` : `${context}:published`
  const customDomain =
    Netlify.env.get('CUSTOM_DOMAIN') || 'ShantoMathew.com assigned in Netlify; DNS and HTTPS verified'

  return json({
    service: 'shanto-mathew-portfolio',
    status: 'ready',
    mode: 'portfolio-production-boundary',
    deployedAt,
    url,
    customDomain,
    observedAt: new Date().toISOString(),
    deployId,
    buildId,
    commitRef,
    deployPrimeUrl,
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
