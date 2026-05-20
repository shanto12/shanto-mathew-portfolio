import type { Achievement, SkillGroup } from '../lib/types'

export const profile = {
  name: 'Shanto Mathew',
  domain: 'ShantoMathew.com',
  location: 'Dallas-Fort Worth Metroplex',
  headline: 'Senior AI Security Automation Engineer & Agentic AI Builder',
  summary:
    'I build governed AI systems that automate security operations, connect tools through APIs, and turn ambitious demos into deployed, testable products.',
  availability: 'Open to impactful GenAI, security automation, SOAR/XSOAR/XSIAM, and forward-deployed AI roles.',
  linkedinUrl: 'https://www.linkedin.com/in/shanto-mathew/',
  githubUrl: 'https://github.com/shanto12',
}

export const achievements: Achievement[] = [
  {
    value: '50+',
    label: 'SOAR playbooks',
    detail: 'Built and maintained playbooks across SIEM alerts, EDR response, enrichment, routing, and case workflow automation.',
  },
  {
    value: '70%',
    label: 'Faster response paths',
    detail: 'Reduced repetitive incident-response work through enrichment, deduplication, routing, and analyst-assist automation.',
  },
  {
    value: '95%',
    label: 'Initial triage target',
    detail: 'Designed LLM-assisted classification workflows with structured outputs, guardrails, and human review boundaries.',
  },
  {
    value: '9',
    label: 'Live public demos',
    detail: 'Shipped Netlify-hosted AI, voice, security, and product demos with docs, health checks, and production verification.',
  },
]

export const skillGroups: SkillGroup[] = [
  {
    title: 'AI Engineering',
    summary: 'LLM systems that are grounded, observable, and useful in operational workflows.',
    items: ['Agentic AI', 'RAG', 'LangGraph-style orchestration', 'LangChain', 'MCP tooling', 'Structured outputs'],
  },
  {
    title: 'Security Automation',
    summary: 'SOAR and SOC workflows that remove toil while preserving human approval.',
    items: ['Cortex XSOAR', 'Cortex XSIAM', 'Splunk SOAR', 'Playbook engineering', 'Incident response', 'Audit trails'],
  },
  {
    title: 'Platform & APIs',
    summary: 'Python-heavy integration work across cloud, security tooling, and data workflows.',
    items: ['Python', 'REST/JSON APIs', 'FastAPI patterns', 'AWS Bedrock/Lambda', 'CI/CD', 'Observability'],
  },
  {
    title: 'Product Delivery',
    summary: 'Public-safe, recruiter-ready software artifacts that can be opened, tested, and reviewed.',
    items: ['React', 'TypeScript', 'Netlify Functions', 'CSP/security headers', 'Vitest', 'Playwright'],
  },
]

export const principles = [
  {
    title: 'Ship proof, not promises',
    copy: 'Every serious demo gets a live URL, health endpoint, docs, tests, and evidence that the deployed surface was actually exercised.',
  },
  {
    title: 'Keep humans in control',
    copy: 'AI can enrich, classify, summarize, and draft, but sensitive security decisions need approvals, logs, and reversible workflows.',
  },
  {
    title: 'Automate the repetitive path',
    copy: 'The best automation usually removes context switching, enrichment loops, stale handoffs, and reporting drag.',
  },
  {
    title: 'Make systems inspectable',
    copy: 'Readable source, clear data provenance, public-safe fixtures, and explicit known limits matter as much as the UI.',
  },
]
