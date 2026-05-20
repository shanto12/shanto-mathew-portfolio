import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const healthResponse = {
  status: 'ready',
  mode: 'test',
  deployedAt: 'test',
  checks: [{ name: 'Portfolio UI', status: 'ready', detail: 'Rendered in test.' }],
}

describe('Shanto Mathew portfolio', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        const target = typeof url === 'string' ? url : url.toString()
        if (target === '/api/health') {
          return new Response(JSON.stringify(healthResponse), { status: 200 })
        }
        if (target === '/api/contact') {
          const body = JSON.parse(String(init?.body ?? '{}')) as { message?: string }
          if (!body.message || body.message.length < 12) {
            return new Response(JSON.stringify({ ok: false, message: 'Please include a short message.' }), { status: 400 })
          }
          return new Response(JSON.stringify({ ok: true, id: 'contact-test', message: 'Message validated.' }), {
            status: 200,
          })
        }
        if (target === '/') {
          return new Response('', { status: 200 })
        }
        return new Response('', { status: 404 })
      }),
    )
  })

  it('renders the main identity, navigation, and live demo links', async () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /shanto mathew home/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Shanto Mathew' })).toBeInTheDocument()
    expect(screen.getByText(/Senior AI Security Automation Engineer/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view demo gallery/i })).toHaveAttribute('href', '#demos')

    const gallery = screen.getByRole('heading', { name: /live netlify demo gallery/i }).closest('section')
    expect(gallery).not.toBeNull()
    expect(within(gallery!).getAllByRole('link', { name: /Open live demo/i })[0]).toHaveAttribute(
      'href',
      'https://security-ops-playbook-analyzer.netlify.app',
    )
    expect(screen.getByRole('link', { name: /LinkedIn profile/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/shanto-mathew/',
    )
  })

  it('filters the demo gallery by category', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Security AI' }))
    expect(screen.getByRole('heading', { name: 'SOC AI Agent Demo' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Flux Atlas' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Creative Systems' }))
    expect(screen.getByRole('heading', { name: 'Flux Atlas' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'SOC AI Agent Demo' })).not.toBeInTheDocument()
  })

  it('submits the contact workflow through the backend boundary', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Name'), 'Avery Recruiter')
    await user.type(screen.getByLabelText('Email'), 'avery@example.com')
    await user.type(screen.getByLabelText('Company or context'), 'Security platform role')
    await user.type(screen.getByLabelText('Message'), 'I would like to discuss an AI security automation role.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText('Message validated.')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }))
  })
})
