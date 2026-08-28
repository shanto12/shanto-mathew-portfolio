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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/I make complex systems.*feel inevitable/i)
    expect(screen.getByText('Forward Deployed AI Engineer', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('1,000+')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Shanto Mathew smiling in a suit/i })).toHaveAttribute(
      'src',
      '/shanto-mathew-headshot.jpeg',
    )
    expect(screen.getByRole('link', { name: /explore the work/i })).toHaveAttribute('href', '#work')

    const gallery = screen.getByRole('heading', { name: /open systems/i }).closest('section')
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

    await user.click(screen.getByRole('button', { name: /Security AI/ }))
    expect(screen.getAllByRole('heading', { name: 'SOC AI Agent Demo' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'Flux Atlas' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Creative Systems/ }))
    expect(screen.getByRole('heading', { name: 'Flux Atlas' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'SOC AI Agent Demo' }).length).toBeGreaterThan(0)
  })

  it('surfaces the agent relay and conversation shortcuts', async () => {
    const user = userEvent.setup()
    render(<App />)

    const relay = screen.getByRole('tablist', { name: /agentic tools in the loop/i })
    for (const label of ['Grok Bot', 'Claude Code', 'Codex', 'OpenClaw', 'Hermes agents']) {
      await user.click(within(relay).getByRole('tab', { name: new RegExp(label) }))
    }

    await user.click(screen.getByRole('button', { name: 'Agent workflow' }))
    expect(screen.getByLabelText('Context')).toHaveValue('Agent workflow')
    expect(screen.getByLabelText('Message')).toHaveValue('I want to explore a better agent workflow.')
  })

  it('submits the contact workflow through the backend boundary', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Name'), 'Avery Recruiter')
    await user.type(screen.getByLabelText('Email'), 'avery@example.com')
    await user.type(screen.getByLabelText('Context'), 'Security platform role')
    await user.type(screen.getByLabelText('Message'), 'I would like to discuss an AI security automation role.')
    await user.click(screen.getByRole('button', { name: /send the signal/i }))

    expect(await screen.findByText('Message validated.')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }))
  })
})
