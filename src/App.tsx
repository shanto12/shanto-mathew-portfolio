import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Code2,
  ExternalLink,
  Layers3,
  Mail,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from 'lucide-react'
import { achievements, principles, profile, skillGroups } from './data/profile'
import { categories, demos } from './data/demos'
import { excludedFromPublicSite, publicSources } from './data/sources'
import { submitContact, type ContactPayload } from './lib/contact'
import { useHealth } from './hooks/useHealth'
import type { Demo, DemoCategory, IconComponent } from './lib/types'

type CategoryFilter = (typeof categories)[number]

const categoryIcons: Record<DemoCategory, IconComponent> = {
  'Security AI': ShieldCheck,
  'Voice AI': Bot,
  'Revenue AI': Network,
  'Creative Systems': Sparkles,
}

const accentLabels: Record<Demo['accent'], string> = {
  teal: 'Teal system preview',
  emerald: 'Emerald system preview',
  amber: 'Amber workflow preview',
  slate: 'Slate command preview',
}

const initialContact: ContactPayload = {
  name: '',
  email: '',
  company: '',
  message: '',
}

function GithubMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.77.6-3.36-1.18-3.36-1.18-.45-1.15-1.1-1.45-1.1-1.45-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.88 1.52 2.32 1.08 2.88.82.09-.64.35-1.08.63-1.33-2.21-.25-4.54-1.1-4.54-4.92 0-1.09.39-1.98 1.03-2.67-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.07c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.69 1.03 1.58 1.03 2.67 0 3.83-2.33 4.66-4.55 4.91.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  )
}

function LinkedinMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.5h4v11H3v-11Zm6.1 0h3.84v1.5h.05c.54-.96 1.86-1.98 3.82-1.98 4.09 0 4.84 2.69 4.84 6.18v5.3h-4v-4.7c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48v4.78h-4V9.5Z"
      />
    </svg>
  )
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Shanto Mathew home">
        <span className="brand-mark" aria-hidden="true">
          <ShieldCheck size={21} />
        </span>
        <span>{profile.domain}</span>
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#achievements">Achievements</a>
        <a href="#skills">Skills</a>
        <a href="#demos">Demos</a>
        <a href="#approach">Approach</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="header-actions">
        <a href={profile.githubUrl} aria-label="GitHub profile">
          <GithubMark size={20} />
        </a>
        <a href={profile.linkedinUrl} aria-label="LinkedIn profile">
          <LinkedinMark size={20} />
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <p className="domain-line">{profile.domain}</p>
        <h1>{profile.name}</h1>
        <p className="hero-title">{profile.headline}</p>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-actions">
          <a className="button primary" href="#demos">
            View demo gallery
            <ArrowUpRight size={18} />
          </a>
          <a className="button secondary" href="#contact">
            Get in touch
            <Mail size={18} />
          </a>
        </div>
        <div className="hero-proof" aria-label="Profile highlights">
          <span>
            <MapPin size={16} />
            {profile.location}
          </span>
          <span>
            <CheckCircle2 size={16} />
            {profile.availability}
          </span>
        </div>
      </div>
      <div className="hero-visual" aria-label="AI security automation command map">
        <img src="/hero-command-map.png" alt="" />
      </div>
    </section>
  )
}

function AchievementStrip() {
  return (
    <section className="section achievement-section" id="achievements" aria-labelledby="achievements-heading">
      <div className="section-heading compact">
        <h2 id="achievements-heading">Built for security operations, shipped like product</h2>
        <p>Public-safe proof points drawn from Shanto's profile materials and deployed demo evidence.</p>
      </div>
      <div className="achievement-grid">
        {achievements.map((item) => (
          <article className="achievement-card" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section className="section skill-section" id="skills" aria-labelledby="skills-heading">
      <div className="section-heading">
        <h2 id="skills-heading">Skills & systems</h2>
        <p>Focused on governed agentic AI, SOAR automation, Python integrations, and deployable product surfaces.</p>
      </div>
      <div className="skill-grid">
        {skillGroups.map((group, index) => {
          const icons = [Bot, ShieldCheck, TerminalSquare, Layers3]
          const Icon = icons[index] ?? Code2
          return (
            <article className="skill-card" key={group.title}>
              <div className="skill-card__top">
                <Icon size={22} />
                <h3>{group.title}</h3>
              </div>
              <p>{group.summary}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function DemoThumbnail({ demo }: { demo: Demo }) {
  const Icon = categoryIcons[demo.category]
  return (
    <div className={`demo-thumb demo-thumb--${demo.accent}`} aria-label={accentLabels[demo.accent]}>
      <div className="thumb-topline">
        <span />
        <span />
        <span />
      </div>
      <Icon size={28} />
      <div className="thumb-grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

function DemoGallery() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')

  const filteredDemos = useMemo(
    () => (activeCategory === 'All' ? demos : demos.filter((demo) => demo.category === activeCategory)),
    [activeCategory],
  )

  return (
    <section className="section demo-section" id="demos" aria-labelledby="demos-heading">
      <div className="section-heading with-action">
        <div>
          <h2 id="demos-heading">Live Netlify demo gallery</h2>
          <p>Every card links to the deployed Netlify site so visitors can experience the work directly.</p>
        </div>
        <a className="button secondary slim" href={profile.githubUrl}>
          GitHub
          <GithubMark size={17} />
        </a>
      </div>
      <div className="filter-row" role="group" aria-label="Filter demos">
        {categories.map((category) => (
          <button
            className={activeCategory === category ? 'filter active' : 'filter'}
            key={category}
            type="button"
            aria-pressed={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="demo-grid">
        {filteredDemos.map((demo) => {
          const Icon = categoryIcons[demo.category]
          return (
            <article className="demo-card" key={demo.slug}>
              <DemoThumbnail demo={demo} />
              <div className="demo-card__body">
                <div className="demo-card__meta">
                  <span>
                    <Icon size={15} />
                    {demo.category}
                  </span>
                </div>
                <h3>{demo.title}</h3>
                <p>{demo.purpose}</p>
                <div className="tag-row" aria-label={`${demo.title} technologies`}>
                  {demo.stack.slice(0, 4).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <p className="proof-line">{demo.proof}</p>
              </div>
              <div className="demo-card__links">
                <a href={demo.url} target="_blank" rel="noreferrer">
                  Open live demo
                  <ExternalLink size={16} />
                </a>
                {demo.repoUrl ? (
                  <a href={demo.repoUrl} target="_blank" rel="noreferrer">
                    Source
                    <GithubMark size={16} />
                  </a>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Approach() {
  const health = useHealth()

  return (
    <section className="section approach-section" id="approach" aria-labelledby="approach-heading">
      <div className="section-heading">
        <h2 id="approach-heading">How I build</h2>
        <p>Production discipline applied to personal demos: public-safe data, backend boundaries, deployment proof, and clear limits.</p>
      </div>
      <div className="approach-layout">
        <div className="principles-grid">
          {principles.map((principle) => (
            <article className="principle-card" key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </div>
        <aside className="evidence-panel" aria-label="Portfolio backend status">
          <div className="status-top">
            <span className={`status-dot status-dot--${health.status}`} />
            <div>
              <strong>{health.status === 'checking' ? 'Checking backend' : `Backend ${health.status}`}</strong>
              <p>{health.mode}</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>API</dt>
              <dd>/api/health</dd>
            </div>
            <div>
              <dt>Deploy</dt>
              <dd>{health.deployedAt}</dd>
            </div>
          </dl>
          <ul className="status-list">
            {health.checks.map((check) => (
              <li key={check.name}>
                <CheckCircle2 size={16} />
                <span>
                  <strong>{check.name}</strong>
                  {check.detail}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <div className="source-row" aria-label="Public data policy">
        <div>
          <h3>Sources used</h3>
          <ul>
            {publicSources.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Not published</h3>
          <ul>
            {excludedFromPublicSite.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [payload, setPayload] = useState<ContactPayload>(initialContact)
  const [state, setState] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const updatePayload = (field: keyof ContactPayload, value: string) => {
    setPayload((current) => ({ ...current, [field]: value }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('submitting')
    setMessage('')

    const result = await submitContact(payload)
    if (result.ok) {
      setState('sent')
      setMessage(result.message)
      setPayload(initialContact)
    } else {
      setState('error')
      setMessage(result.message)
    }
  }

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="contact-copy">
        <h2 id="contact-heading">Let us build something inspectable.</h2>
        <p>
          I am easiest to evaluate through working software. Open the demos above, review the source where public, then reach out
          with the role or workflow you want to discuss.
        </p>
        <div className="contact-actions">
          <a className="button primary" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
            Connect on LinkedIn
            <LinkedinMark size={18} />
          </a>
          <a className="button secondary" href={profile.githubUrl} target="_blank" rel="noreferrer">
            View GitHub
            <GithubMark size={18} />
          </a>
        </div>
      </div>
      <form className="contact-form" name="portfolio-contact" method="POST" data-netlify="true" onSubmit={onSubmit}>
        <input type="hidden" name="form-name" value="portfolio-contact" />
        <label>
          Name
          <input
            name="name"
            autoComplete="name"
            value={payload.name}
            onChange={(event) => updatePayload('name', event.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={payload.email}
            onChange={(event) => updatePayload('email', event.target.value)}
            required
          />
        </label>
        <label>
          Company or context
          <input
            name="company"
            value={payload.company}
            onChange={(event) => updatePayload('company', event.target.value)}
            placeholder="Role, team, or workflow"
          />
        </label>
        <label>
          Message
          <textarea
            name="message"
            value={payload.message}
            onChange={(event) => updatePayload('message', event.target.value)}
            rows={5}
            required
          />
        </label>
        <button className="button primary full" type="submit" disabled={state === 'submitting'}>
          {state === 'submitting' ? 'Sending...' : 'Send message'}
          <ArrowUpRight size={18} />
        </button>
        <p className={`form-status form-status--${state}`} role="status" aria-live="polite">
          {message}
        </p>
      </form>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>{profile.domain}</span>
      <span>AI security automation, agentic AI, SOAR, and deployed product demos.</span>
      <a href="#home">Back to top</a>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AchievementStrip />
        <Skills />
        <DemoGallery />
        <Approach />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
