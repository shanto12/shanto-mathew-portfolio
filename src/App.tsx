import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  Mail,
  MapPin,
  Menu,
  Network,
  Play,
  Radar,
  Rocket,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
  X,
  Zap,
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

const stageIcons = [Radar, Workflow, Rocket, Activity] as const
const systemStages = [
  { label: 'Discover', code: '01 / SIGNAL', copy: 'Find the bottleneck, the human decision, and the proof that would make it useful.', color: 'cyan' },
  { label: 'Design', code: '02 / SHAPE', copy: 'Turn messy workflows into clear agent boundaries, tool calls, approvals, and handoffs.', color: 'violet' },
  { label: 'Deploy', code: '03 / SHIP', copy: 'Put the system in front of real users with a small blast radius and a fast feedback loop.', color: 'lime' },
  { label: 'Observe', code: '04 / LEARN', copy: 'Measure the path, capture the edge cases, and keep humans in control of the next move.', color: 'orange' },
] as const

const initialContact: ContactPayload = { name: '', email: '', company: '', message: '' }

function GithubMark({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.77.6-3.36-1.18-3.36-1.18-.45-1.15-1.1-1.45-1.1-1.45-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.88 1.52 2.32 1.08 2.88.82.09-.64.35-1.08.63-1.33-2.21-.25-4.54-1.1-4.54-4.92 0-1.09.39-1.98 1.03-2.67-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.07c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.69 1.03 1.58 1.03 2.67 0 3.83-2.33 4.66-4.55 4.91.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>
}

function LinkedinMark({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.5h4v11H3v-11Zm6.1 0h3.84v1.5h.05c.54-.96 1.86-1.98 3.82-1.98 4.09 0 4.84 2.69 4.84 6.18v5.3h-4v-4.7c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48v4.78h-4V9.5Z" /></svg>
}

function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return <header className="site-header"><a className="brand" href="#home" aria-label="Shanto Mathew home" onClick={close}><span className="brand-mark" aria-hidden="true"><ShieldCheck size={19} /></span><span className="brand-wordmark">SM<span className="brand-dot">.</span></span><span className="brand-domain">ShantoMathew.com</span></a><button className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen((value) => !value)}>{open ? <X size={20} /> : <Menu size={20} />}<span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span></button><nav id="primary-nav" className={open ? 'nav-links nav-links--open' : 'nav-links'} aria-label="Primary navigation"><a href="#work" onClick={close}>Work</a><a href="#skills" onClick={close}>Skills</a><a href="#method" onClick={close}>Method</a><a href="#contact" onClick={close}>Contact</a></nav><div className="header-actions"><a className="icon-link" href={profile.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub profile"><GithubMark size={18} /></a><a className="icon-link" href={profile.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn profile"><LinkedinMark size={18} /></a><a className="header-cta" href="#contact" onClick={close}>Let&apos;s talk <ArrowUpRight size={15} /></a></div></header>
}

function StatusPill({ children, tone = 'lime' }: { children: ReactNode; tone?: string }) {
  return <span className={`status-pill status-pill--${tone}`}><span className="status-pulse" />{children}</span>
}

function HeroWorkbench() {
  const [activeStage, setActiveStage] = useState(2)
  const stage = systemStages[activeStage]
  useEffect(() => { const timer = window.setInterval(() => setActiveStage((current) => (current + 1) % systemStages.length), 4200); return () => window.clearInterval(timer) }, [])
  return <div className="workbench-wrap" aria-label="Animated AI delivery system map"><div className="workbench-glow workbench-glow--one" /><div className="workbench-glow workbench-glow--two" /><div className="workbench"><div className="workbench-topbar"><div className="window-dots"><span /><span /><span /></div><span className="mono">fde://delivery-loop</span><StatusPill>LIVE LOOP</StatusPill></div><div className="workbench-heading"><div><p className="eyebrow eyebrow--small"><ScanLine size={13} /> SYSTEM MAP / 04 STAGES</p><h2>From signal<br /><em>to shipped.</em></h2></div><div className="workbench-score"><strong>98</strong><span>signal<br />clarity</span></div></div><div className="orbit-field" aria-hidden="true"><div className="orbit orbit--outer" /><div className="orbit orbit--inner" /><div className="orbit-core"><ShieldCheck size={25} /><span>HITL</span></div><span className="orbit-node orbit-node--a"><Bot size={14} /></span><span className="orbit-node orbit-node--b"><Code2 size={14} /></span><span className="orbit-node orbit-node--c"><Cloud size={14} /></span><span className="orbit-node orbit-node--d"><Database size={14} /></span><div className="orbit-scan" /></div><div className="stage-track" role="tablist" aria-label="Delivery stages">{systemStages.map((item, index) => { const Icon = stageIcons[index]; return <button className={activeStage === index ? `stage stage--active stage--${item.color}` : 'stage'} type="button" role="tab" aria-selected={activeStage === index} key={item.label} onClick={() => setActiveStage(index)}><span className="stage-index">{String(index + 1).padStart(2, '0')}</span><Icon size={15} /><span>{item.label}</span></button> })}</div><div className={`stage-detail stage-detail--${stage.color}`}><div><span className="mono">{stage.code}</span><strong>{stage.label}</strong></div><p>{stage.copy}</p><span className="stage-arrow"><ChevronRight size={17} /></span></div><div className="signal-footer"><span><CircleDot size={13} /> agents online</span><span className="signal-bars"><i /><i /><i /><i /><i /></span><span className="mono">latency 42ms</span></div></div><div className="floating-note floating-note--top"><Zap size={14} /> human approval built in</div><div className="floating-note floating-note--bottom"><GitBranch size={14} /> deploy / observe / repeat</div></div>
}

function Hero() {
  return <section className="hero section-shell" id="home"><div className="hero-copy"><div className="hero-kicker"><StatusPill>OPEN TO THE RIGHT PROBLEM</StatusPill><span className="mono">AI × SECURITY × PRODUCT</span></div><p className="eyebrow">Forward-deployed AI engineer</p><h1>I make complex systems<br /><span>feel inevitable.</span></h1><p className="hero-summary">I&apos;m Shanto Mathew — a senior AI security automation engineer who turns messy operational workflows into governed, useful, beautifully shipped software.</p><div className="hero-actions"><a className="button button--primary" href="#work">Explore the work <ArrowDownRight size={17} /></a><a className="button button--ghost" href="#contact">Start a conversation <Mail size={17} /></a></div><div className="hero-proof-row"><span><MapPin size={15} /> Dallas–Fort Worth · remote-friendly</span><span><CheckCircle2 size={15} /> public-safe by design</span></div></div><HeroWorkbench /></section>
}

function Marquee() {
  const items = ['AGENTIC AI', 'SECURITY AUTOMATION', 'SOAR / XSOAR / XSIAM', 'PYTHON + APIs', 'VOICE SYSTEMS', 'PRODUCT DELIVERY']
  return <div className="marquee" aria-label="Core disciplines"><div className="marquee-track">{[...items, ...items].map((item, index) => <span key={`${item}-${index}`}>{item}<i>✳</i></span>)}</div></div>
}

function Impact() {
  return <section className="section-shell impact-section" id="impact" aria-labelledby="impact-heading"><div className="section-intro section-intro--split"><div><p className="eyebrow">The receipts</p><h2 id="impact-heading">Built where<br /><span>stakes are real.</span></h2></div><p>My work lives at the intersection of security, automation, and the moment a prototype has to earn trust. The numbers are shorthand for the systems behind them.</p></div><div className="impact-grid">{achievements.map((item, index) => <article className={`impact-card impact-card--${index + 1}`} key={item.label}><div className="impact-card-top"><span className="mono">0{index + 1}</span><ArrowUpRight size={17} /></div><strong>{item.value}</strong><h3>{item.label}</h3><p>{item.detail}</p><div className="impact-meter"><span style={{ width: `${[86, 70, 95, 64][index]}%` }} /></div></article>)}</div></section>
}

function SkillIcon({ index }: { index: number }) {
  const icons = [Bot, ShieldCheck, TerminalSquare, Layers]
  const Icon = icons[index] ?? Braces
  return <Icon size={19} />
}

function Skills() {
  const [activeSkill, setActiveSkill] = useState(0)
  const group = skillGroups[activeSkill]
  return <section className="section-shell skills-section" id="skills" aria-labelledby="skills-heading"><div className="section-intro section-intro--split"><div><p className="eyebrow">The toolkit</p><h2 id="skills-heading">A wide lens.<br /><span>Sharp edges.</span></h2></div><p>Forward-deployed work rewards range: understand the security problem, prototype the interface, wire the backend, then stay close enough to users to make it land.</p></div><div className="skills-layout"><div className="skill-rail" role="tablist" aria-label="Skill groups">{skillGroups.map((item, index) => <button className={activeSkill === index ? 'skill-tab skill-tab--active' : 'skill-tab'} type="button" role="tab" aria-selected={activeSkill === index} key={item.title} onClick={() => setActiveSkill(index)}><span className="skill-tab-icon"><SkillIcon index={index} /></span><span><small>0{index + 1}</small>{item.title}</span><ChevronRight size={16} /></button>)}<div className="skill-rail-foot"><span className="status-pulse" /> always learning / always shipping</div></div><div className={`skill-detail skill-detail--${activeSkill}`}><div className="skill-detail-head"><div><span className="mono">CAPABILITY / 0{activeSkill + 1}</span><h3>{group.title}</h3></div><span className="skill-spark"><Sparkles size={19} /></span></div><p>{group.summary}</p><div className="skill-chip-grid">{group.items.map((item) => <span key={item}><Check size={13} />{item}</span>)}</div><div className="skill-detail-bottom"><span><Activity size={15} /> practical, not ornamental</span><span className="mono">{String(group.items.length).padStart(2, '0')} / focus areas</span></div></div></div></section>
}

function DemoPreview({ demo }: { demo: Demo }) {
  const Icon = categoryIcons[demo.category]
  const colors: Record<Demo['accent'], string> = { teal: 'cyan', emerald: 'lime', amber: 'orange', slate: 'violet' }
  return <div className={`demo-preview demo-preview--${colors[demo.accent]}`} aria-label={`${demo.title} interface preview`}><div className="preview-chrome"><span /><span /><span /><span className="mono">/ {demo.slug.replaceAll('-', '_')}</span></div><div className="preview-content"><div className="preview-sidebar"><i /><i /><i /><i /></div><div className="preview-main"><div className="preview-title"><Icon size={16} /><span>RUN / {demo.category.toUpperCase()}</span><b /></div><div className="preview-chart"><i /><i /><i /><i /><i /><i /><i /></div><div className="preview-cards"><span /><span /><span /></div></div></div><span className="preview-stamp"><Play size={10} fill="currentColor" /> LIVE</span></div>
}

function DemoGallery() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')
  const filteredDemos = useMemo(() => activeCategory === 'All' ? demos : demos.filter((demo) => demo.category === activeCategory), [activeCategory])
  return <section className="section-shell work-section" id="work" aria-labelledby="work-heading"><div className="section-intro section-intro--work"><div><p className="eyebrow">The field notes</p><h2 id="work-heading">Open systems.<br /><span>Real interfaces.</span></h2></div><div className="work-intro-side"><p>Click around. Break the happy path. The work below is meant to be experienced, not just described.</p><a className="text-link" href={profile.githubUrl} target="_blank" rel="noreferrer">Browse the source on GitHub <ArrowUpRight size={15} /></a></div></div><div className="filter-row" role="group" aria-label="Filter demos">{categories.map((category) => <button className={activeCategory === category ? 'filter filter--active' : 'filter'} key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}<span>{category === 'All' ? demos.length : demos.filter((demo) => demo.category === category).length}</span></button>)}</div><div className="demo-grid">{filteredDemos.map((demo, index) => { const Icon = categoryIcons[demo.category]; return <article className="demo-card" key={demo.slug}><div className="demo-card-top"><span className="mono">WORK / {String(index + 1).padStart(2, '0')}</span><span className="demo-category"><Icon size={13} />{demo.category}</span></div><DemoPreview demo={demo} /><div className="demo-card-body"><h3>{demo.title}</h3><p>{demo.purpose}</p><div className="tag-row">{demo.stack.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div><p className="proof-line"><CheckCircle2 size={14} /> {demo.proof}</p></div><div className="demo-card-links"><a href={demo.url} target="_blank" rel="noreferrer">Open live demo <ExternalLink size={15} /></a>{demo.repoUrl ? <a href={demo.repoUrl} target="_blank" rel="noreferrer" aria-label={`${demo.title} source`}>Source <GithubMark size={15} /></a> : <span className="mono demo-private">case study / public preview</span>}</div></article> })}</div></section>
}

function Method() {
  const [activePrinciple, setActivePrinciple] = useState(0)
  const health = useHealth()
  const principle = principles[activePrinciple]
  return <section className="section-shell method-section" id="method" aria-labelledby="method-heading"><div className="section-intro section-intro--split"><div><p className="eyebrow">The operating system</p><h2 id="method-heading">Fast enough<br /><span>to matter.</span></h2></div><p>Good FDE work is a relay race between empathy, technical judgment, and momentum. I keep the loop legible so the team can move with confidence.</p></div><div className="method-layout"><div className="principle-list" role="tablist" aria-label="How Shanto builds">{principles.map((item, index) => <button className={activePrinciple === index ? 'principle-row principle-row--active' : 'principle-row'} key={item.title} type="button" role="tab" aria-selected={activePrinciple === index} onClick={() => setActivePrinciple(index)}><span className="principle-number">0{index + 1}</span><span>{item.title}</span><ChevronRight size={17} /></button>)}</div><div className={`principle-detail principle-detail--${activePrinciple}`}><div className="principle-detail-icon"><Zap size={22} /></div><span className="mono">WORKING PRINCIPLE / 0{activePrinciple + 1}</span><h3>{principle.title}</h3><p>{principle.copy}</p><div className="principle-line" /><span className="principle-foot">a useful system leaves a trail <ArrowUpRight size={15} /></span></div></div><div className="health-strip"><div className="health-copy"><StatusPill tone={health.status === 'ready' ? 'lime' : 'orange'}>{health.status === 'checking' ? 'CHECKING LIVE SURFACE' : `BACKEND ${health.status.toUpperCase()}`}</StatusPill><span>Production boundary · /api/health</span></div><div className="health-checks">{health.checks.slice(0, 3).map((check) => <span key={check.name}><Check size={13} />{check.name}</span>)}</div></div><div className="sources-grid" aria-label="Public data policy"><div><span className="mono">SOURCES USED</span><ul>{publicSources.map((source) => <li key={source}>{source}</li>)}</ul></div><div><span className="mono">NOT PUBLISHED</span><ul>{excludedFromPublicSite.map((source) => <li key={source}>{source}</li>)}</ul></div></div></section>
}

function Contact() {
  const [payload, setPayload] = useState<ContactPayload>(initialContact)
  const [state, setState] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const updatePayload = (field: keyof ContactPayload, value: string) => setPayload((current) => ({ ...current, [field]: value }))
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setState('submitting'); setMessage(''); const result = await submitContact(payload); if (result.ok) { setState('sent'); setMessage(result.message); setPayload(initialContact) } else { setState('error'); setMessage(result.message) } }
  return <section className="contact-section section-shell" id="contact" aria-labelledby="contact-heading"><div className="contact-orb contact-orb--one" /><div className="contact-orb contact-orb--two" /><div className="contact-copy"><p className="eyebrow">Your move</p><h2 id="contact-heading">Have a hard problem?<br /><span>Let&apos;s make it legible.</span></h2><p>Tell me about the workflow, the users, or the strange constraint. I&apos;m interested in work where technical depth and clear communication both count.</p><div className="contact-links"><a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><LinkedinMark size={17} /> LinkedIn <ArrowUpRight size={14} /></a><a href={profile.githubUrl} target="_blank" rel="noreferrer"><GithubMark size={17} /> GitHub <ArrowUpRight size={14} /></a></div></div><form className="contact-form" name="portfolio-contact" method="POST" data-netlify="true" onSubmit={onSubmit}><input type="hidden" name="form-name" value="portfolio-contact" /><label><span>Name</span><input name="name" autoComplete="name" value={payload.name} onChange={(event) => updatePayload('name', event.target.value)} placeholder="Your name" required /></label><label><span>Email</span><input name="email" type="email" autoComplete="email" value={payload.email} onChange={(event) => updatePayload('email', event.target.value)} placeholder="you@company.com" required /></label><label><span>Context</span><input name="company" value={payload.company} onChange={(event) => updatePayload('company', event.target.value)} placeholder="Role, team, or workflow" /></label><label><span>Message</span><textarea name="message" value={payload.message} onChange={(event) => updatePayload('message', event.target.value)} placeholder="What are you trying to make better?" rows={5} required /></label><button className="button button--primary button--full" type="submit" disabled={state === 'submitting'}>{state === 'submitting' ? 'Routing message...' : 'Send the signal'}<Send size={16} /></button><p className={`form-status form-status--${state}`} role="status" aria-live="polite">{message}</p></form></section>
}

function Footer() {
  return <footer className="site-footer section-shell"><div className="footer-brand"><span className="brand-mark"><ShieldCheck size={17} /></span><span>ShantoMathew.com</span></div><span className="footer-note">AI security automation · agentic AI · forward-deployed systems</span><a href="#home">Back to top <ArrowUpRight size={14} /></a></footer>
}

export default function App() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><Hero /><Marquee /><Impact /><Skills /><DemoGallery /><Method /><Contact /></main><Footer /></>
}
