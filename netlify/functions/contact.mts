type ContactPayload = {
  name?: unknown
  email?: unknown
  company?: unknown
  message?: unknown
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ ok: false, message: 'Use POST for contact submissions.' }, 405)
  }

  let payload: ContactPayload
  try {
    payload = (await req.json()) as ContactPayload
  } catch {
    return json({ ok: false, message: 'Invalid JSON payload.' }, 400)
  }

  const name = asString(payload.name)
  const email = asString(payload.email)
  const company = asString(payload.company)
  const message = asString(payload.message)

  if (name.length < 2) return json({ ok: false, message: 'Please enter your name.' }, 400)
  if (!validEmail(email)) return json({ ok: false, message: 'Please enter a valid email address.' }, 400)
  if (message.length < 12) return json({ ok: false, message: 'Please include a short message.' }, 400)
  if (message.length > 2400) return json({ ok: false, message: 'Please keep the message under 2400 characters.' }, 400)

  const id = `contact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

  console.log(
    JSON.stringify({
      event: 'portfolio_contact_validated',
      id,
      nameLength: name.length,
      emailDomain: email.split('@')[1],
      companyLength: company.length,
      messageLength: message.length,
    }),
  )

  return json({
    ok: true,
    id,
    message: 'Message validated. In production, Netlify Forms captures the submission for follow-up.',
  })
}

export const config = {
  path: '/api/contact',
}
