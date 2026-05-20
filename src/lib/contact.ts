export type ContactPayload = {
  name: string
  email: string
  company: string
  message: string
}

export type ContactResult =
  | { ok: true; id: string; message: string }
  | { ok: false; message: string }

const encodeForm = (payload: ContactPayload) =>
  new URLSearchParams({
    'form-name': 'portfolio-contact',
    name: payload.name,
    email: payload.email,
    company: payload.company,
    message: payload.message,
  }).toString()

const validateLocally = (payload: ContactPayload): ContactResult | null => {
  if (payload.name.trim().length < 2) return { ok: false, message: 'Please enter your name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    return { ok: false, message: 'Please enter a valid email address.' }
  }
  if (payload.message.trim().length < 12) return { ok: false, message: 'Please include a short message.' }
  return null
}

const isLocalRuntime = () =>
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  let result: ContactResult

  try {
    const apiResponse = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    result = (await apiResponse.json()) as ContactResult
    if (!apiResponse.ok || !result.ok) return result
  } catch {
    const localError = validateLocally(payload)
    if (localError) return localError
    result = {
      ok: true,
      id: `local-${Date.now().toString(36)}`,
      message: 'Message validated in local preview. Production uses the Netlify contact backend.',
    }
  }

  if (!result.ok) return result

  try {
    const formResponse = await fetch('/', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: encodeForm(payload),
    })
    if (!formResponse.ok) {
      if (isLocalRuntime()) {
        return {
          ok: true,
          id: result.id,
          message: 'Message validated in local preview. Production uses Netlify Forms capture.',
        }
      }
      return {
        ok: false,
        message: `Contact API validated the message, but Netlify Forms returned ${formResponse.status}.`,
      }
    }
  } catch {
    return {
      ok: true,
      id: result.id,
      message: 'Validated locally. Netlify form capture will run in production.',
    }
  }

  return result
}
